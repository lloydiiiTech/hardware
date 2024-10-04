// models/AdminModels.js
const db = require('../config/db');

const addProduct = (productData) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO tblproduct SET ?';
        db.query(query, productData, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};




const getAllProducts = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT `ProductID`, `ProductName`, `Price`, `NumberOfStock`, `Description`, `Picture`, `Category`, `Status` FROM `tblproduct` WHERE 1';
        db.query(query, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};


const getProductById = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM tblproduct WHERE ProductID = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results[0]); // Return the product object
        });
    });
};
const updateProduct = (id, productData) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE tblproduct SET ? WHERE ProductID = ?';
        
        // Log the query and data to be executed
        console.log("Executing query:", query, productData, id);

        db.query(query, [productData, id], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return reject(err);
            }
            resolve(result);
        });
    });
};





// Function to delete a product
const deleteProduct = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM tblproduct WHERE ProductID = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

const updateProductStock = (ProductName, Quantity, Status) => {
    let updateQuery;
    
    if (Status === "Sale") {
        updateQuery = `
        UPDATE tblproduct 
        SET NumberOfStock = NumberOfStock - ?
        WHERE ProductName = ?
    `;
    } else if (Status === "Restock") {
        updateQuery = `
        UPDATE tblproduct 
        SET NumberOfStock = NumberOfStock + ?
        WHERE ProductName = ?
    `;
    } else if (Status === "Refund") {
        updateQuery = `
        UPDATE tblproduct 
        SET NumberOfStock = NumberOfStock + ?
        WHERE ProductName = ?
    `;
    }

    return new Promise((resolve, reject) => {
        db.query(updateQuery, [Quantity, ProductName], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};


















// Model to download inventory
// In your Product model


    // Model to clear inventory
   



    
module.exports = { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct, updateProductStock, 
    };