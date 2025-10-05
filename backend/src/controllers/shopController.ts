import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as cartService from "../services/cart.service";
import * as orderService from "../services/order.service";
import * as paymentService from "../services/payment.service";

export const getCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    const cart = await cartService.getUserCart(userId);
    res.status(200).json(cart);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar carrinho" });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { productId, quantity } = req.body;

  try {
    // 🔹 Retorna o objeto completo do CartItem criado
    const cartItem = await cartService.addItemToCart(userId, productId, quantity);
    res.json(cartItem);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { itemId } = req.params;

  try {
    const result = await cartService.removeItemFromCart(userId, Number(itemId));
    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const checkoutCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const order = await orderService.checkoutUserCart(userId);
    res.status(201).json({ message: "Checkout concluído", order });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { items } = req.body;

  try {
    const order = await orderService.createOrderDirect(userId, items);
    res.status(201).json({ message: "Pedido criado", order });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const orders = await orderService.getUserOrders(userId);
    res.json(orders);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  try {
    const order = await orderService.getOrderById(userId, Number(id));
    res.json(order);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const createStripePayment = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { orderId } = req.body;

  try {
    const paymentIntent = await paymentService.createStripePaymentIntent(
      userId,
      Number(orderId)
    );
    res.json(paymentIntent);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};