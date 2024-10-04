const express = require('express');
const router = express.Router();
const hardware = require('../controller/hardwareController');

router.get('/',hardware.index);
router.get('/index',hardware.index);
// router.get('/shop',hardware.shop);
// router.get('/shop',hardware.shop);
// router.get('/shop_details',hardware.shop_details);
// router.get('/shoping_cart',hardware.shoping_cart);
// router.get('/check_out',hardware.check_out);
// router.get('/blog_details',hardware.blog_details);
// router.get('/blog',hardware.blog);
// router.get('/contact',hardware.contact);
// router.get('/cart',hardware.cart);
// router.get('/login',hardware.login);
// router.get('/pages',hardware.pages);



const UserController = require('../controller/UserController');

// Login routes
router.get('/login', UserController.login);
router.post('/login', UserController.loginPost);

// Registration routes
router.get('/register', UserController.register);
router.post('/register', UserController.registerPost);

// Protected route (requires authentication)
router.get('/dashboard', UserController.verifyToken, (req, res) => {
    res.render('dashboard', { user: req.user });
});

// Logout route
router.get('/logout', UserController.logout);



router.get('/forgot-password', UserController.forgotPassword);
router.post('/forgot-password', UserController.forgotPasswordPost);
router.get('/reset-password/:token', UserController.resetPassword);
router.post('/reset-password/:token', UserController.resetPasswordPost);


const admin = require('../controller/AdminController');

router.get('/admin', admin.getSalesData);

router.get('/api/sales-data', admin.fetchSalesData);

router.get('/products', admin.adminproduct);  // Ensure adminproduct is defined and exported
router.get('/adproduct', admin.adminadproduct);
router.post('/addproduct', admin.adminaddproduct);
router.get('/product/:id', admin.adminproductdetails); // Use GET to retrieve product details

router.post('/updateproduct/:id', admin.updateproduct);

router.post('/deleteproduct/:id', admin.deleteproduct);
router.get('/restock', admin.getRestockPage);
router.post('/restock', admin.restockProduct);

router.get('/orders', admin.fetchPendingOrders);
router.post('/orders/accept/:orderID', admin.acceptOrder);

router.get('/on-going', admin.fetchProcessOrders);
router.post('/orders/OFD/:id', admin.outforDelivery);

router.get('/ofd', admin.fetchOFDOrders);
router.post('/orders/Done/:id', admin.updatetoDone);

router.post('/orders/pending/cancel/:id', admin.CancelPending);
router.post('/orders/process/cancel/:id', admin.CancelProcess);
router.post('/orders/ofd/cancel/:id', admin.CancelOFD);

router.get('/done', admin.fetchDONEOrders);
router.post('/orders/refund/:id', admin.Refund);

router.get('/refund', admin.fetchREFUNDOrders);

router.get('/inventory', admin.fetchInventory);
router.get('/inventory/download', admin.downloadInventory);
router.post('/inventory/clear', admin.clearInventory);



module.exports = router;