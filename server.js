var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var sql = require('mssql');
var GeoJSON = require('geojson');

app.use(bodyParser.json());
app.use(express.json())
app.use(cors());

var config = {
    user: 'sde',
    password: 'Sdgis12345mn',
    server: '103.31.82.102',
    database: 'Audit',
    options: {
        trustedConnection: true
    },
    port: 1433
};

function getData(req, res) {
    let conn = new sql.ConnectionPool(config);
    conn.connect()
        .then(function () {
            let req = new sql.Request(conn);
            req.query("SELECT * FROM ZONGOSP")
                .then(function (result) {
                    let data = result.recordset;
                    res.send(data);
                    conn.close();
                })
                .catch(function (err) {
                    console.log(err);
                    conn.close();
                });
        })
        .catch(function (err) {
            console.log(err);
        });
}

function getDataById(req, res) {
    var userId = req.params.id; // Assuming the user ID is passed as a route parameter

    let conn = new sql.ConnectionPool(config);
    conn.connect()
        .then(function () {
            let req = new sql.Request(conn);
            req.query(`SELECT * FROM ZONGOSP WHERE ID = ${userId}`)
                .then(function (result) {
                    if (result.recordset.length > 0) {
                        res.send(result.recordset[0]); // Assuming you want to send the first record matching the ID
                    } else {
                        res.status(404).send("User not found.");
                    }
                    conn.close();
                })
                .catch(function (err) {
                    console.log(err);
                    conn.close();
                    res.status(500).send("Failed to retrieve user data.");
                });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send("Failed to connect to the database.");
        });
}

function postData(req, res) {
    var newCustomerData = req.body;

    let conn = new sql.ConnectionPool(config);
    conn.connect()
        .then(function () {
            let req = new sql.Request(conn);
            req.query(`
                INSERT INTO ZONGOSP (ID,No_of_Pit, Survey_Date, Ring_Tag, Section_Name, Trench_Depth_Ft, Latitude, Longitude, Trench_Alignment, Observations, Correction_Required, Correction_Length, Trench_Distance)
                VALUES ('${newCustomerData.ID}','${newCustomerData.No_of_Pit}','${newCustomerData.Survey_Date}', '${newCustomerData.Ring_Tag}', '${newCustomerData.Section_Name}', '${newCustomerData.Trench_Depth_Ft}', '${newCustomerData.Latitude}','${newCustomerData.Longitude}','${newCustomerData.Trench_Alignment}','${newCustomerData.Observations}','${newCustomerData.Correction_Required}', '${newCustomerData.Correction_Length}','${newCustomerData.Trench_Distance}')`)
                .then(function () {
                    console.log("New customer added successfully!");
                    res.send("New customer added successfully!");
                    conn.close();
                })
                .catch(function (err) {
                    console.log(err);
                    conn.close();
                });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send("Failed to connect to the database.");
        });
}

function updateData(req, res) {
    var userId = req.params.id; // Assuming the user ID is passed as a route parameter
    var updatedUserData = req.body; // Assuming you're sending updated user data in the request body

    let conn = new sql.ConnectionPool(config);
    conn.connect()
        .then(function () {
            let req = new sql.Request(conn);
            req.query(`
                UPDATE ZONGOSP
                SET ID = '${updatedUserData.ID}', 
                    No_of_Pit = '${updatedUserData.No_of_Pit}', 
                    Survey_Date = '${updatedUserData.Survey_Date}', 
                    Ring_Tag = '${updatedUserData.Ring_Tag}', 
                    Section_Name = '${updatedUserData.Section_Name}', 
                    Trench_Depth_Ft = '${updatedUserData.Trench_Depth_Ft}', 
                    Latitude = '${updatedUserData.Latitude}', 
                    Longitude = '${updatedUserData.Longitude}', 
                    Trench_Alignment = '${updatedUserData.Trench_Alignment}', 
                    Observations = '${updatedUserData.Observations}', 
                    Correction_Required = '${updatedUserData.Correction_Required}', 
                    Correction_Length = '${updatedUserData.Correction_Length}', 
                    Trench_Distance = '${updatedUserData.Trench_Distance}'
                WHERE ID = ${userId}`)
                .then(function () {
                    res.send(`User with ID ${userId} updated successfully.`);
                    conn.close();
                })
                .catch(function (err) {
                    console.log(err);
                    conn.close();
                    res.status(500).send(`Failed to update user. Error: ${err.message}`);
                });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(`Failed to connect to the database. Error: ${err.message}`);
        });
}

function deleteDataById(req, res) {
    var userId = req.params.id; // Assuming the user ID is passed as a route parameter

    let conn = new sql.ConnectionPool(config);
    conn.connect()
        .then(function () {
            let req = new sql.Request(conn);
            req.query(`DELETE FROM ZONGOSP WHERE ID = ${userId}`)
                .then(function () {
                    res.send(`User with ID ${userId} deleted successfully.`);
                    conn.close();
                })
                .catch(function (err) {
                    console.log(err);
                    conn.close();
                    res.status(500).send(`Failed to delete user. Error: ${err.message}`);
                });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(`Failed to connect to the database. Error: ${err.message}`);
        });
}

app.get('/customers', getData);
app.post('/customers', postData);
app.put('/customersupdate/:id', updateData);
app.get('/customers/:id', getDataById); // Adding route to get user by ID
app.delete('/customers/:id', deleteDataById);
var server = app.listen(39917, function () {
    console.log('Server is running on port 39917..');
});