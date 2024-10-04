const multer = require('multer');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const ExcelJS = require('exceljs'); 


const Product = require('../models/ProductModels');
const Inventory = require('../models/InventoryModels');
const Orders = require('../models/OrderModels');


// Configure multer storage directly in the controller
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/imageproduct';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true }); // Create directory if it doesn't exist
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Define the filename with timestamp
    }
});

const upload = multer({ storage }).single('Picture');


const adminaddproduct = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(500).json({ error: 'Error uploading file' });
        }

        // Check if the file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { ProductName, Price, NumberOfStock, Description, Category } = req.body;
        const Picture = req.file ? `/imageproduct/${req.file.filename}` : null;
        Status = 'Available';
        const productData = {
            ProductName,
            Price,
            NumberOfStock,
            Description,
            Picture,
            Category,
            Status
        };

        try {
            // Call the model to insert the product into the database
            const result = await Product.addProduct(productData);
            
            // Insert into tblprodinv
            await Inventory.insertIntoInventory({
                ProductName,
                Quantity: NumberOfStock,
                Changes_type: 'New Product',
                Date: new Date() // Current date and time
            });
            req.flash('success', 'Product added successfully');

            res.redirect(`/products`); // Redirect to the products page
        } catch (error) {
            req.flash('error', 'Server error while adding product');
            res.redirect(`/products`); // Redirect to the products page
        }
    });
};

const adminproduct = async(req, res) => {
    try {
        const products = await Product.getAllProducts(); // Fetch products from the model
        res.render('adminproduct', { products }); // Render the view with the products
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Server error while fetching products');
    }
};

const adminproductdetails = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.getProductById(id);
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/products');
        }
        res.render('adminproductupdate', { product });
    } catch (error) {
        console.error('Error fetching product:', error);
        req.flash('error', 'Server error while fetching product details');
        res.redirect('/products');
    }
};

const updateproduct = async (req, res) => {
    const { id } = req.params;
    
    // Log request body to verify the data sent by the form
    console.log("Request Body: ", req.body);

    const { ProductName, Price, NumberOfStock, Description, Category } = req.body;

    // Check if any of the values are undefined
    if (!ProductName || !Price || !NumberOfStock || !Description || !Category) {
        req.flash('error', 'All fields are required.');
        return res.redirect(`/updateproduct/${id}`);
    }

    const productData = {
        ProductName,
        Price,
        NumberOfStock,
        Description,
        Category
    };

    try {
        const result = await Product.updateProduct(id, productData);
        console.log("Update Result: ", result);

        if (result.affectedRows === 0) {
            req.flash('error', 'Product not found or no changes made');
        } else {
            req.flash('success', 'Product updated successfully');
        }

        res.redirect('/products');
    } catch (error) {
        console.error('Error updating product:', error);
        req.flash('error', 'Server error while updating product');
        res.redirect(`/updateproduct/${id}`);
    }
};




// Controller to handle deleting a product
const deleteproduct = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Product.deleteProduct(id);
        if (result.affectedRows === 0) {
            req.flash('error', 'Product not found');
        } else {
            req.flash('success', 'Product deleted successfully');
        }
        res.redirect('/products');
    } catch (error) {
        console.error('Error deleting product:', error);
        req.flash('error', 'Server error while deleting product');
        res.redirect('/products');
    }
};


// Other admin controller functions
const admin = (req, res) => {
    res.render('adminhome');
};



const adminadproduct = (req, res) => {
    res.render('adminaddproduct');
};





const adminproductdelete = (req, res) => {
    res.render('adminproductdelete');
};

const adminorders = (req, res) => {
    res.render('adminorders');
};

const adminordersongoing = (req, res) => {
    res.render('adminprocess');
};

const adminordesofd = (req, res) => {
    res.render('adminOFD');
};

const adminordersdone = (req, res) => {
    res.render('admindone');
};

const adminuser = (req, res) => {
    res.render('adminuser');
};

const admincontact = (req, res) => {
    res.render('admincontact');
};



const getRestockPage = async(req, res) => {
    try {
        const products = await Product.getAllProducts(); // Fetch products from the model
        res.render('adminproductrestock', { products }); // Render the view with the products
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Server error while fetching products');
    }
};

// Function to restock product
const restockProduct = async (req, res) => {
    const { ProductName, Quantity } = req.body; // Extracting from request body

    try {
        // Update the product stock using the Product model (corrected to "Restock")
        await Product.updateProductStock(ProductName, Quantity, "Restock");

        // Insert into inventory using the Product model
        await Inventory.insertIntoInventory({
            ProductName,
            Quantity, // Use Quantity from the request body
            Changes_type: 'Restock', // Type of change
            Date: new Date() // Current date for the transaction
        });

        req.flash('success', 'Product restocked successfully!');
        res.redirect('/restock');
    } catch (err) {
        console.error(err);
        return res.status(500).send("Server Error");
    }
};





const fetchPendingOrders = async (req, res) => {
    try {
        const orders = await Orders.getOrders("Pending");
        res.render('adminorders', { orders });
    } catch (err) {
        console.error('Error retrieving pending orders:', err);
        res.status(500).send('Error retrieving pending orders');
    }
};



const acceptOrder = async (req, res) => {
    const orderID = req.params.orderID;

    try {
        // Update the order status to 'On-going'
        await Orders.updateOrderStatus(orderID, "On-going");
        
        // Fetch order details
        const orderDetails = await Orders.getOrderDetails(orderID);
        console.log('Fetched Order Details:', orderDetails); // Debugging line
        
        if (!orderDetails) {
            throw new Error('Order not found');
        }

        // Define the path to the Downloads folder
        const downloadsDir = 'C:\\Users\\lloydiii_29\\Downloads';
        const pdfPath = path.join(downloadsDir, `order_${orderDetails.OrderID}.pdf`);

        // Log the path for debugging
        console.log('PDF will be saved to:', pdfPath);

        // Create a new PDF document
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(pdfPath);

        // Handle write stream errors
        writeStream.on('error', (err) => {
            console.error('Error writing PDF:', err);
            return res.status(500).send('Error generating PDF');
        });

        // Pipe the PDF document to the write stream
        doc.pipe(writeStream);
        
        // Add content to PDF
        doc.text(`Order ID: ${orderDetails.OrderID}`);
        doc.text(`Receipt`);
        doc.text(`Full Name: ${orderDetails.FullName || 'N/A'}`);
        doc.text(`Email: ${orderDetails.Email || 'N/A'}`);
        doc.text(`Contact Number: ${orderDetails.ContactNumber || 'N/A'}`);
        doc.text(`Location: ${orderDetails.Location || 'N/A'}`);
        doc.text(`Product: ${orderDetails.ProductName || 'N/A'}`);
        doc.text(`Quantity: ${orderDetails.Quantity}`);
        doc.text(`Unit Price: $${Number(orderDetails.Price).toFixed(2)}`);
        doc.text(`Total Price: $${Number(orderDetails.TotalPrice).toFixed(2)}`);
        
        // Finalize the PDF and end the stream
        doc.end();

        // After the write stream finishes, send a response
        writeStream.on('finish', () => {
            console.log('PDF successfully written to:', pdfPath); // Log success
            res.download(pdfPath, `order_${orderDetails.OrderID}.pdf`, (err) => {
                if (err) {
                    console.error('Error downloading the PDF:', err);
                    return res.status(500).send('Error downloading PDF');
                }
                res.redirect('/orders');
            });
        });

    } catch (err) {
        console.error('Error in acceptOrder:', err);
        res.status(500).send('Error updating order status');
    }
};






const fetchProcessOrders = async (req, res) => {
    try {
        const orders = await Orders.getOrders("On-going");
        res.render('adminprocess', { orders });
    } catch (err) {
        console.error('Error retrieving pending orders:', err);
        res.status(500).send('Error retrieving pending orders');
    }
};

const outforDelivery = async (req, res) => {
    const orderID = req.params.id; // Get order ID from the route parameter
    try {
        await Orders.updateOrderStatus(orderID, "Out-for-Delivery");
        res.redirect('/on-going'); // After updating, redirect back to the ongoing orders page
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).send('Error updating order status');
    }
};




const fetchOFDOrders = async (req, res) => {
    try {
        const orders = await Orders.getOrders("Out-for-Delivery");
        res.render('adminOFD', { orders });
    } catch (err) {
        console.error('Error retrieving pending orders:', err);
        res.status(500).send('Error retrieving pending orders');
    }
};
const updatetoDone = async (req, res) => {
    const orderID = req.params.id; // Get order ID from the route parameter
    try {
        // Update the order status to 'Done'
        await Orders.updateOrderStatus(orderID, "Done");

        // Fetch order details to insert into the inventory
        const orderDetails = await Orders.getinvetDetails(orderID);

        // Insert into `tblprodinv` (Inventory) with negative quantity for sales
        await Inventory.insertIntoInventory({
            ProductName: orderDetails.ProductName,
            Quantity: -orderDetails.Quantity, // Save as negative to indicate a sale
            Changes_type: 'Sale',
            Date: new Date() // Current date for the transaction
        });

        // Update product stock (subtract the quantity from the current stock)
        await Product.updateProductStock(orderDetails.ProductName, orderDetails.Quantity, "Sale");

        // After updating, redirect back to the ongoing orders page
        res.redirect('/ofd');
    } catch (err) {
        console.error('Error updating order status and inserting into inventory:', err);
        res.status(500).send('Error updating order status and inserting into inventory');
    }
};


const CancelPending = async (req, res) => {
    const orderID = req.params.id; // Get order ID from the route parameter
    try {
        await Orders.updateOrderStatus(orderID, "Cancel");
        res.redirect('/orders'); // After updating, redirect back to the ongoing orders page
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).send('Error updating order status');
    }
};
const CancelProcess = async (req, res) => {
    const orderID = req.params.id; // Get order ID from the route parameter
    try {
        await Orders.updateOrderStatus(orderID, "Cancel");
        res.redirect('/on-going'); // After updating, redirect back to the ongoing orders page
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).send('Error updating order status');
    }
};
const CancelOFD = async (req, res) => {
    const orderID = req.params.id; // Get order ID from the route parameter
    try {
        await Orders.updateOrderStatus(orderID, "Cancel");
        res.redirect('/ofd'); // After updating, redirect back to the ongoing orders page
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).send('Error updating order status');
    }
};

const fetchDONEOrders = async (req, res) => {
    try {
        const orders = await Orders.getOrders("Done");
        res.render('admindone', { orders });
    } catch (err) {
        console.error('Error retrieving pending orders:', err);
        res.status(500).send('Error retrieving pending orders');
    }
};



const Refund = async (req, res) => {
    const orderID = req.params.id; // Get order ID from the route parameter
    
    try {
        // Update the order status to 'Done'
        await Orders.updateOrderStatus(orderID, "Refund");

        // Fetch order details to insert into the inventory
        const orderDetails = await Orders.getinvetDetails(orderID);

        // Insert into `tblprodinv` (Inventory) with negative quantity for sales
        await Inventory.insertIntoInventory({
            ProductName: orderDetails.ProductName,
            Quantity: orderDetails.Quantity, // Save as negative to indicate a sale
            Changes_type: 'Refund',
            Date: new Date() // Current date for the transaction
        });

        // Update product stock (subtract the quantity from the current stock)
        await Product.updateProductStock(orderDetails.ProductName, orderDetails.Quantity, "Refund");

        // After updating, redirect back to the ongoing orders page
        res.redirect('/done');
    } catch (err) {
        console.error('Error updating order status and inserting into inventory:', err);
        res.status(500).send('Error updating order status and inserting into inventory');
    }
};


const fetchREFUNDOrders = async (req, res) => {
    try {
        const orders = await Orders.getREfundStatus();
        res.render('adminrefund', { orders });
    } catch (err) {
        console.error('Error retrieving pending orders:', err);
        res.status(500).send('Error retrieving pending orders');
    }
};



const fetchInventory = async (req, res) => {
    const searchQuery = req.query.search || '';
    try {
        const inventory = await Inventory.getInventory(searchQuery);
        res.render('admininventory', { inventory });
    } catch (err) {
        console.error('Error fetching inventory:', err);
        res.status(500).send('Server Error');
    }
};
const downloadInventory = async (req, res) => {
    try {
        const searchQuery = req.query.search || ''; // Fetch the search query
        console.log('Search query:', searchQuery); // Log the search query

        // Fetch inventory based on search query
        const inventory = await Inventory.downloadInventory(searchQuery);
        console.log('Fetched inventory:', inventory); // Log the fetched inventory

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventory');

        worksheet.columns = [
            { header: 'Inventory ID', key: 'InventoryID', width: 15 },
            { header: 'Product Name', key: 'ProductName', width: 30 },
            { header: 'Quantity', key: 'Quantity', width: 10 },
            { header: 'Changes Type', key: 'Changes_type', width: 20 },
            { header: 'Date', key: 'Date', width: 20 },
        ];

        // Add rows to the worksheet based on the fetched inventory
        inventory.forEach(item => {
            worksheet.addRow(item);
        });

        // Set response headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=inventory.xlsx');

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Error exporting inventory as Excel:', err);
        res.status(500).send('Server Error: ' + err.message);
    }
};






const clearInventory = async (req, res) => {
    try {
        await Inventory.clearInventory();
        req.flash('success', 'Inventory cleared successfully!');
        res.redirect('/inventory');
    } catch (err) {
        console.error('Error clearing inventory:', err);
        res.status(500).send('Server Error');
    }
};


const getSalesData = (req, res) => {
    Inventory.getSalesData((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        // Render the view without sending data here
        res.render('adminhome'); // Render the admin home view
    });
};

const fetchSalesData = (req, res) => {
    Inventory.getSalesData((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results); // Send JSON response
    });
};

module.exports = {
    admin,
    adminproduct,
    
    adminproductdelete,
    adminorders,
    adminordersongoing,
    adminordesofd,
    adminordersdone,
    adminuser,
    admincontact,
    adminaddproduct,
    adminadproduct,
    adminproductdetails, // <-- Add this line
    deleteproduct,
    updateproduct,
    getRestockPage,
    restockProduct,
    fetchPendingOrders,
    acceptOrder,

    fetchProcessOrders,
    outforDelivery,

    fetchOFDOrders,
    updatetoDone,

    fetchDONEOrders,
    Refund,
    fetchREFUNDOrders,
    fetchInventory,
    downloadInventory,
    clearInventory,
    CancelPending,
    CancelProcess,
    CancelOFD,
    getSalesData,
    fetchSalesData
};

