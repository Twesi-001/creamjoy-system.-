import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';

// Components
import Dashboard from './components/Dashboard/Dashboard';
import BatchList from './components/Batches/BatchList';
import BatchForm from './components/Batches/BatchForm';
import ProductList from './components/Products/ProductList';
import OrderList from './components/Orders/OrderList';
import OrderForm from './components/Orders/OrderForm';
import DeliveryList from './components/Deliveries/DeliveryList';
import InventoryList from './components/Inventory/InventoryList';
import RawMaterialList from './components/Inventory/RawMaterialList';
import CustomerList from './components/Customers/CustomerList';
import CreditList from './components/CreditAccounts/CreditList';
import SupplierList from './components/Suppliers/SupplierList';
import ExpenditureForm from './components/expenditure/ExpenditureForm';
import Login from './components/Auth/Login';
import PrivateRoute from './components/Auth/PrivateRoute';
import Layout from './components/Layout/Layout';
import AdminDashboard from './components/Admin/AdminDashboard';
import ChangePassword from './components/Auth/ChangePassword';
import NotFoundPage from './components/NotFoundPage';

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        <PrivateRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/change-password" element={
                        <PrivateRoute>
                            <Layout>
                                <ChangePassword />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/batches" element={
                        <PrivateRoute>
                            <Layout>
                                <BatchList />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/batches/new" element={
                        <PrivateRoute>
                            <Layout>
                                <BatchForm />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/products" element={
                        <PrivateRoute>
                            <Layout>
                                <ProductList />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/orders" element={
                        <PrivateRoute>
                            <Layout>
                                <OrderList />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/orders/new" element={
                        <PrivateRoute>
                            <Layout>
                                <OrderForm />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/deliveries" element={
                        <PrivateRoute>
                            <Layout>
                                <DeliveryList />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/inventory" element={
                        <PrivateRoute>
                            <Layout>
                                <InventoryList />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/raw-materials" element={
                        <PrivateRoute>
                            <Layout>
                                <RawMaterialList />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/suppliers" element={
                        <PrivateRoute>
                            <Layout>
                                <SupplierList />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/customers" element={
                        <PrivateRoute>
                            <Layout>
                                <CustomerList />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/credit" element={
                        <PrivateRoute>
                            <Layout>
                                <CreditList />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/expenditures/new" element={
                        <PrivateRoute>
                            <Layout>
                                <ExpenditureForm />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/admin" element={
                        <PrivateRoute>
                            <Layout>
                                <AdminDashboard />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Router>
        </ErrorBoundary>
    );
};

export default App;