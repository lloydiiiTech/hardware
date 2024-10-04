
const db = require('../config/db');

const insertIntoInventory = ({ ProductName, Quantity, Changes_type, Date }) => {
    const insertQuery = `
        INSERT INTO tblprodinv (ProductName, Quantity, Changes_type, Date) 
        VALUES (?, ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
        db.query(insertQuery, [ProductName, Quantity, Changes_type, Date], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};





const getInventory = (searchQuery) => {
    const query = `
        SELECT InventoryID, ProductName, Quantity, Changes_type, Date
        FROM tblprodinv
        WHERE ProductName LIKE ?
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [`%${searchQuery}%`], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};



const downloadInventory = (searchQuery) => {
    const query = `
        SELECT InventoryID, ProductName, Quantity, Changes_type, Date
        FROM tblprodinv
        WHERE ProductName LIKE ? OR Changes_type LIKE ?
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [`%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};


const clearInventory = () => {
    const query = `DELETE FROM tblprodinv WHERE 1`;
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const getSalesData = (callback) => {
    const sql = "SELECT `ProductName`, `Quantity`, `Date` FROM `tblprodinv` WHERE `Changes_type` = 'Sale'";
    db.query(sql, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};
module.exports = {
    insertIntoInventory, 
    getInventory,
    downloadInventory,
    clearInventory,
    getSalesData
};
