from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me')
JWT_ALGO = "HS256"
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
ORDER_RECIPIENT_EMAIL = os.environ.get('ORDER_RECIPIENT_EMAIL', '')
STORE_NAME = os.environ.get('STORE_NAME', 'Electroyes')

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ============ Models ============
class ProductBase(BaseModel):
    code: str
    name: str
    description: str = ""
    price: float
    stock: int = 0
    images: List[str] = Field(default_factory=list)  # base64 data URLs, 1-4


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    images: Optional[List[str]] = None


class Product(ProductBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_at: str


class OrderItem(BaseModel):
    product_id: str
    code: str
    name: str
    quantity: int
    unit_price: float
    subtotal: float


class OrderCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr
    items: List[OrderItem]


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    first_name: str
    last_name: str
    phone: str
    email: str
    items: List[OrderItem]
    total: float
    created_at: str
    email_sent: bool = False


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    token: str


# ============ Auth ============
def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("sub") != ADMIN_USERNAME:
        raise HTTPException(status_code=403, detail="Forbidden")
    return True


@api_router.post("/auth/admin/login", response_model=TokenResponse)
async def admin_login(req: LoginRequest):
    if req.username != ADMIN_USERNAME or req.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return TokenResponse(token=create_token(req.username))


@api_router.get("/auth/admin/me")
async def admin_me(_: bool = Depends(require_admin)):
    return {"username": ADMIN_USERNAME}


# ============ Products ============
@api_router.get("/products", response_model=List[Product])
async def list_products():
    docs = await db.products.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@api_router.get("/products/{code}", response_model=Product)
async def get_product(code: str):
    doc = await db.products.find_one({"code": code}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return doc


@api_router.post("/products", response_model=Product)
async def create_product(payload: ProductCreate, _: bool = Depends(require_admin)):
    existing = await db.products.find_one({"code": payload.code}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="El código ya existe")
    if len(payload.images) > 4:
        raise HTTPException(status_code=400, detail="Máximo 4 imágenes")
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, payload: ProductUpdate, _: bool = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "images" in update and len(update["images"]) > 4:
        raise HTTPException(status_code=400, detail="Máximo 4 imágenes")
    if "code" in update:
        conflict = await db.products.find_one({"code": update["code"], "id": {"$ne": product_id}}, {"_id": 0})
        if conflict:
            raise HTTPException(status_code=400, detail="El código ya existe")
    result = await db.products.find_one_and_update(
        {"id": product_id},
        {"$set": update},
        return_document=True,
        projection={"_id": 0},
    )
    if not result:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return result


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, _: bool = Depends(require_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"ok": True}


# ============ Orders ============
def build_email_html(order: dict) -> str:
    rows = ""
    for item in order["items"]:
        rows += f"""
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;">{item['code']}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;">{item['name']}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;text-align:center;">{item['quantity']}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;text-align:right;">${item['unit_price']:,.2f}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;text-align:right;"><b>${item['subtotal']:,.2f}</b></td>
        </tr>
        """
    return f"""
    <!doctype html>
    <html><body style="margin:0;padding:0;background:#fdf6f5;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6f5;padding:24px 0;">
        <tr><td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
            <tr><td style="background:#f5675a;padding:24px;color:#fff;font-family:Arial,sans-serif;">
              <div style="font-size:22px;font-weight:700;">Nuevo pedido — {STORE_NAME}</div>
              <div style="font-size:13px;opacity:0.9;margin-top:4px;">Recibido el {order['created_at']}</div>
            </td></tr>
            <tr><td style="padding:24px;font-family:Arial,sans-serif;color:#333;">
              <h3 style="margin:0 0 12px 0;font-size:16px;color:#f5675a;">Datos del cliente</h3>
              <p style="margin:4px 0;font-size:14px;"><b>Nombre:</b> {order['first_name']} {order['last_name']}</p>
              <p style="margin:4px 0;font-size:14px;"><b>Teléfono:</b> {order['phone']}</p>
              <p style="margin:4px 0;font-size:14px;"><b>Email:</b> {order['email']}</p>

              <h3 style="margin:24px 0 12px 0;font-size:16px;color:#f5675a;">Detalle del pedido</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <thead>
                  <tr style="background:#fdf6f5;">
                    <th style="padding:8px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#666;">Código</th>
                    <th style="padding:8px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#666;">Producto</th>
                    <th style="padding:8px;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#666;">Cant.</th>
                    <th style="padding:8px;text-align:right;font-family:Arial,sans-serif;font-size:12px;color:#666;">P. Unit.</th>
                    <th style="padding:8px;text-align:right;font-family:Arial,sans-serif;font-size:12px;color:#666;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>

              <div style="text-align:right;margin-top:20px;font-family:Arial,sans-serif;font-size:18px;color:#111;">
                <b>Total: ${order['total']:,.2f}</b>
              </div>
            </td></tr>
            <tr><td style="background:#111;padding:16px;text-align:center;color:#aaa;font-family:Arial,sans-serif;font-size:12px;">
              {STORE_NAME} · Pedido generado desde la tienda online
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>
    """


async def send_order_email(order: dict) -> bool:
    if not RESEND_API_KEY or not ORDER_RECIPIENT_EMAIL:
        logger.warning("Resend not configured; skipping email")
        return False
    params = {
        "from": f"{STORE_NAME} <{SENDER_EMAIL}>",
        "to": [ORDER_RECIPIENT_EMAIL],
        "subject": f"Nuevo pedido #{order['id'][:8]} — {order['first_name']} {order['last_name']}",
        "html": build_email_html(order),
    }
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent: {result}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False


@api_router.post("/orders", response_model=Order)
async def create_order(payload: OrderCreate):
    if not payload.items:
        raise HTTPException(status_code=400, detail="El pedido no tiene productos")

    # Validate items against DB & recompute totals (trust server pricing)
    validated_items = []
    total = 0.0
    for item in payload.items:
        prod = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not prod:
            raise HTTPException(status_code=400, detail=f"Producto {item.name} ya no existe")
        if prod["stock"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"Sin stock suficiente para {prod['name']}")
        subtotal = round(prod["price"] * item.quantity, 2)
        total += subtotal
        validated_items.append({
            "product_id": prod["id"],
            "code": prod["code"],
            "name": prod["name"],
            "quantity": item.quantity,
            "unit_price": prod["price"],
            "subtotal": subtotal,
        })

    order_doc = {
        "id": str(uuid.uuid4()),
        "first_name": payload.first_name.strip(),
        "last_name": payload.last_name.strip(),
        "phone": payload.phone.strip(),
        "email": payload.email,
        "items": validated_items,
        "total": round(total, 2),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "email_sent": False,
    }

    # Decrement stock
    for item in validated_items:
        await db.products.update_one({"id": item["product_id"]}, {"$inc": {"stock": -item["quantity"]}})

    email_ok = await send_order_email(order_doc)
    order_doc["email_sent"] = email_ok

    await db.orders.insert_one(order_doc)
    order_doc.pop("_id", None)
    return order_doc


@api_router.get("/orders", response_model=List[Order])
async def list_orders(_: bool = Depends(require_admin)):
    docs = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs




@api_router.delete("/orders/{order_id}")
async def delete_order(order_id: str, _: bool = Depends(require_admin)):
    r = await db.orders.delete_one({"id": order_id})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return {"ok": True}

@api_router.get("/")
async def root():
    return {"service": "electroyes-tienda", "status": "ok"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
