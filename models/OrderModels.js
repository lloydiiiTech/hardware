const db = require('../config/db');

const getOrders = (Status) => {
    const query = `
        SELECT 
            o.OrderID, 
            o.Quantity, 
            CONCAT(u.FirstName, ' ', u.MiddleName, ' ', u.LastName, ' ', u.Suffix) AS FullName,
            u.Email, 
            u.ContactNumber, 
            CONCAT(u.Province, ', ', u.City, ', ', u.Barangay, ', ', u.Street) AS Location,
            p.ProductName, 
            CAST(p.Price AS DECIMAL(10, 2)) AS Price,  -- Convert Price to a number
            (o.Quantity * CAST(p.Price AS DECIMAL(10, 2))) AS TotalPrice, 
            o.Status
        FROM 
            tblorders o
        JOIN 
            tableuser u ON o.\`FK-IdNum\` = u.Id
        JOIN 
            tblproduct p ON o.\`FK-ProductID\` = p.ProductID
        WHERE 
            o.Status = ?;
    `;

    return new Promise((resolve, reject) => {
        // Pass Status as a parameter to the query
        db.query(query, [Status], (err, results) => {
            if (err) {
                console.error('SQL error:', err);
                return reject(err);
            }
            resolve(results);
        });
    });
};


const updateOrderStatus = (orderID, Status) => {
    const updateQuery = `UPDATE tblorders SET Status = ? WHERE OrderID = ?`;
    
    return new Promise((resolve, reject) => {
        db.query(updateQuery, [Status, orderID], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};


const getOrderDetails = (orderID) => {
    const query = `
        SELECT 
            o.OrderID, 
            o.Quantity, 
            CONCAT(u.FirstName, ' ', u.MiddleName, ' ', u.LastName, ' ', u.Suffix) AS FullName,
            u.Email, 
            u.ContactNumber, 
            CONCAT(u.Province, ', ', u.City, ', ', u.Barangay, ', ', u.Street) AS Location,
            p.ProductName, 
            CAST(p.Price AS DECIMAL(10, 2)) AS Price,  
            (o.Quantity * CAST(p.Price AS DECIMAL(10, 2))) AS TotalPrice, 
            o.Status
        FROM 
            tblorders o
        JOIN 
            tableuser u ON o.\`FK-IdNum\` = u.Id
        JOIN 
            tblproduct p ON o.\`FK-ProductID\` = p.ProductID
        WHERE 
            o.OrderID = ?;`;

    return new Promise((resolve, reject) => {
        db.query(query, [orderID], (err, results) => {
            if (err) {
                return reject(err);
            }
            if (results.length === 0) {
                return resolve(null); // No order found
            }
            resolve(results[0]); // Return the first result
        });
    });
};

const getinvetDetails = (orderID) => {
    const query = `
        SELECT 
            p.ProductName, 
            o.Quantity
        FROM 
            tblorders o
        JOIN 
            tblproduct p ON o.\`FK-ProductID\` = p.ProductID
        WHERE 
            o.OrderID = ?
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [orderID], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result[0]);
        });
    });
};


const getREfundStatus = (Status) => {
    const query = `
        SELECT 
            o.OrderID, 
            o.Quantity, 
            CONCAT(u.FirstName, ' ', u.MiddleName, ' ', u.LastName, ' ', u.Suffix) AS FullName,
            u.Email, 
            u.ContactNumber, 
            CONCAT(u.Province, ', ', u.City, ', ', u.Barangay, ', ', u.Street) AS Location,
            p.ProductName, 
            CAST(p.Price AS DECIMAL(10, 2)) AS Price,  -- Convert Price to a number
            (o.Quantity * CAST(p.Price AS DECIMAL(10, 2))) AS TotalPrice, 
            o.Status
        FROM 
            tblorders o
        JOIN 
            tableuser u ON o.\`FK-IdNum\` = u.Id
        JOIN 
            tblproduct p ON o.\`FK-ProductID\` = p.ProductID
        WHERE 
            o.Status = "Refund" OR o.Status = "Cancel";
    `;

    return new Promise((resolve, reject) => {
        // Pass Status as a parameter to the query
        db.query(query, [Status], (err, results) => {
            if (err) {
                console.error('SQL error:', err);
                return reject(err);
            }
            resolve(results);
        });
    });
};


module.exports = {

    getOrders,
    updateOrderStatus,
    getOrderDetails,
    getinvetDetails,
    getREfundStatus,
};