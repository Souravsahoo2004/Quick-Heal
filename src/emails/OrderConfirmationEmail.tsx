// src/emails/OrderConfirmationEmail.tsx
import {
  Body,
  Container,
  Column,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  img: string;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  items: CartItem[];
  address: Address;
  subtotal: number;
  delivery: number;
  total: number;
  expectedDelivery: string;
}

export const OrderConfirmationEmail = ({
  orderNumber = '#QH123456',
  customerName = 'John Doe',
  orderDate = 'Oct 13, 2025',
  items = [],
  address,
  subtotal = 0,
  delivery = 30,
  total = 0,
  expectedDelivery = 'Oct 15, 2025'
}: OrderConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your order {orderNumber} has been confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerText}>QuickHealth</Text>
          </Section>

          {/* Order Confirmation */}
          <Section style={content}>
            <Text style={heading}>Order Confirmed! 🎉</Text>
            <Text style={paragraph}>
              Hi {customerName}, <br /><br />
              Thank you for your order! We've received your order {orderNumber} and 
              we're preparing it for delivery.
            </Text>
          </Section>

          {/* Order Details */}
          <Section style={orderSection}>
            <Text style={sectionTitle}>Order Details</Text>
            <Text style={orderInfo}>
              <strong>Order Number:</strong> {orderNumber}<br />
              <strong>Order Date:</strong> {orderDate}<br />
              <strong>Expected Delivery:</strong> {expectedDelivery}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Items */}
          <Section style={itemsSection}>
            <Text style={sectionTitle}>Items Ordered</Text>
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemImageColumn}>
                  <Img
                    src={item.img}
                    width="60"
                    height="60"
                    alt={item.name}
                    style={itemImage}
                  />
                </Column>
                <Column style={itemDetailsColumn}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemQuantity}>Qty: {item.qty}</Text>
                </Column>
                <Column style={itemPriceColumn}>
                  <Text style={itemPrice}>₹{item.price * item.qty}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Price Summary */}
          <Section style={summarySection}>
            <Text style={sectionTitle}>Order Summary</Text>
            <Row style={summaryRow}>
              <Column style={summaryLabel}>Subtotal:</Column>
              <Column style={summaryValue}>₹{subtotal}</Column>
            </Row>
            <Row style={summaryRow}>
              <Column style={summaryLabel}>Delivery Fee:</Column>
              <Column style={summaryValue}>₹{delivery}</Column>
            </Row>
            <Row style={totalRow}>
              <Column style={totalLabel}>Total:</Column>
              <Column style={totalValue}>₹{total}</Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Delivery Address */}
          <Section style={addressSection}>
            <Text style={sectionTitle}>Delivery Address</Text>
            <Text style={addressText}>
              {address?.name}<br />
              {address?.phone}<br />
              {address?.addressLine1}
              {address?.addressLine2 && `, ${address.addressLine2}`}<br />
              {address?.city}, {address?.state} - {address?.pincode}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions about your order? Contact us at support@quickhealth.com
            </Text>
            <Text style={footerText}>
              Thank you for choosing QuickHealth! 💊
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '20px 30px',
  backgroundColor: '#2563eb',
};

const headerText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0',
};

const content = {
  padding: '30px 30px 0',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  textAlign: 'center' as const,
  margin: '0 0 20px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  textAlign: 'center' as const,
};

const orderSection = {
  padding: '0 30px',
  marginTop: '32px',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '16px',
};

const orderInfo = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '20px',
};

const itemsSection = {
  padding: '0 30px',
};

const itemRow = {
  marginBottom: '16px',
};

const itemImageColumn = {
  width: '80px',
  paddingRight: '16px',
};

const itemImage = {
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const itemDetailsColumn = {
  paddingRight: '16px',
};

const itemName = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#1f2937',
  margin: '0 0 4px',
};

const itemQuantity = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
};

const itemPriceColumn = {
  textAlign: 'right' as const,
  width: '80px',
};

const itemPrice = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0',
};

const summarySection = {
  padding: '0 30px',
};

const summaryRow = {
  marginBottom: '8px',
};

const summaryLabel = {
  fontSize: '14px',
  color: '#6b7280',
  textAlign: 'left' as const,
};

const summaryValue = {
  fontSize: '14px',
  color: '#1f2937',
  textAlign: 'right' as const,
};

const totalRow = {
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: '1px solid #e5e7eb',
};

const totalLabel = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  textAlign: 'left' as const,
};

const totalValue = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  textAlign: 'right' as const,
};

const addressSection = {
  padding: '0 30px',
};

const addressText = {
  fontSize: '14px',
  color: '#374151',
  lineHeight: '20px',
};

const footer = {
  padding: '32px 30px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '8px 0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

export default OrderConfirmationEmail;
