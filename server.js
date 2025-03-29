var express = require("express");
var cloudinary = require("cloudinary").v2;
var mysql2 = require("mysql2");
var fileUploader = require("express-fileupload");
var app = express();
var dotenv = require("dotenv")
dotenv.config()
const path = require('path');




app.listen(2006, function () {
    console.log("Server started ")
});

app.use(express.json());
app.use(express.urlencoded(true));
app.use(express.static(path.join(__dirname, 'public')));


let dbConfig = process.env.dbConfig;
let mysqlServer = mysql2.createConnection(dbConfig);

mysqlServer.connect(function (err) {
    if (err != null) {
        console.log(err.message);
    }
    else {
        console.log("Successful connection established with databse !")
    }
});

app.get("/", function (req, resp) {
    let dirName = __dirname;
    let fullpath = dirName + "/public/index.html";
    resp.sendFile(fullpath);
})
app.get("/index", function (req, resp) {
    let dirName = __dirname;
    let fullpath = dirName + "/public/index.html";
    resp.sendFile(fullpath);
})

app.get("/user-signup-page", function (req, resp) {
    console.log(req.query.sgnEmail)
    mysqlServer.query("INSERT INTO userInfo (email, pwd, dropdown) VALUES (?,?,?)", [req.query.sgnEmail, req.query.sgnPwd, req.query.dropdown1], function (err, res) {
        if (!err) {
            console.log("Data Saved");
            resp.send("Account created successfully, Login now.")
        }
        else {
            console.log(err)
        }
    })
})

app.get("/user-login-page", function (req, resp) {
    let sgnEmail1 = req.query.sgnEmail1;
    let sgnPwd1 = req.query.sgnPwd1;

    mysqlServer.query("SELECT * from userInfo where email=? AND pwd=?", [sgnEmail1, sgnPwd1], function (err, resultArr) {
        if (err == null) {

            if(resultArr.length==0)
               // resp.status(401).send("Invalid credentials");
                 resp.send("Invalid User Id or Password");
            else if(resultArr[0].statuss == 0) {
                    // resp.send("logged in successfully");
                    resp.send(resultArr[0].dropdown);
                }
                else {
                    resp.send("You are BLOCKED user !!");
                }
        }
        else
        {
            resp.send(err.message)
        }
    })
})

app.get("/vol-dash-kyc", function (req, resp) {
    let dirName = __dirname;
    let fullpath = dirName + "/public/vol-kyc.html";
    resp.sendFile(fullpath);
})

app.get("/find-jobs", function (req, resp) {
    let dirName = __dirname;
    let fullpath = dirName + "/public/find-work.html";
    resp.sendFile(fullpath);
})

app.get("/client-page", function (req, resp) {
    //resp.send("New page !!!")
    let dirName = __dirname;
    let fullpath = dirName + "/public/client-profile.html";
    resp.sendFile(fullpath);
})

app.get("/client-dash", function (req, resp){
    let dirName = __dirname;
    let fullpath = dirName + "/public/client-dash.html";
    resp.sendFile(fullpath);
})

app.get("/vol-dash", function (req, resp){
    let dirName = __dirname;
    let fullpath = dirName + "/public/vol-dash.html";
    resp.sendFile(fullpath);
})

app.get("/job-post", function(req, resp){
    let dirName = __dirname;
    let fullpath = dirName + "/public/post-job.html";
    resp.sendFile(fullpath);
})

app.get("/manage-job", function(req, resp){
    let dirName = __dirname;
    let fullpath = dirName + "/public/job-manager.html";
    resp.sendFile(fullpath);
})

app.get("/admin-dash", function(req, resp){
    let dirName = __dirname;
    let fullpath = dirName + "/public/admin-dash.html";
    resp.sendFile(fullpath);
})

app.get("/user-cntrl", function(req, resp){
    let dirName = __dirname;
    let fullpath = dirName + "/public/user-controller.html";
    resp.sendFile(fullpath);
})

app.get("/vol-mngr", function(req, resp){
    let dirName = __dirname;
    let fullpath = dirName + "/public/volu-manager.html";
    resp.sendFile(fullpath);
})

app.get("/client-mngr", function(req, resp){
    let dirName = __dirname;
    let fullpath = dirName + "/public/client-manager.html";
    resp.sendFile(fullpath);
})

app.get("/admin-analytics", function(req, resp){
    let dirName = __dirname;
    let fullpath = dirName + "/public/analytics-dashboard.html";
    resp.sendFile(fullpath);
})


app.use(express.urlencoded(true));
app.use(fileUploader());

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});

app.post("/register-vol", async function (req, res) {
    try {

        let fileName1;
        if (req.files != null) {
            fileName1 = req.files.ukProfPic.name;
            let locationToSave = __dirname + "/public/uploads/" + fileName1;

            await req.files.ukProfPic.mv(locationToSave);

            try {
                let result = await cloudinary.uploader.upload(locationToSave);
                fileName1 = result.url;
                console.log("Uploaded file URL : ", fileName1);
            } catch (uploadError) {
                console.error("Cloudinary Upload Error : ", uploadError);
                res.send("Error uploading file to Cloudinary.")
            }
        }
        else {
            fileName1 = "noPic.jpg";
        }
        // 2 second delay before next upload
        await new Promise(resolve => setTimeout(resolve, 2000));

        let fileName2;
        if (req.files != null) {
            fileName2 = req.files.ukAdharPic.name;
            let locationToSave1 = __dirname + "/public/uploads/" + fileName2;

            await req.files.ukProfPic.mv(locationToSave1);

            try {
                let result1 = await cloudinary.uploader.upload(locationToSave1);
                fileName2 = result1.url;
                console.log("Uploaded file URL : ", fileName2);
            } catch (uploadError) {
                console.error("Cloudinary Upload Error : ", uploadError);
                res.send("Error uploading file to Cloudinary.")
            }
        }
        else {
            fileName2 = "noPic1.jpg";
        }
        // Insert data into MySQL
        mysqlServer.query(
            "INSERT INTO volkyc (emailid, vname, contact, address, city, gender, dob, quali, occu, info, picpath, idpath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                req.body.ukEmail,
                req.body.ukName,
                req.body.ukCnt,
                req.body.ukAdd,
                req.body.ukCity,
                req.body.ukGndr,
                req.body.ukDob,
                req.body.ukQual,
                req.body.ukOccu,
                req.body.ukOtherInfo,
                fileName1,
                fileName2,
            ],
            function (err, result) {
                if (err) {
                    console.error("Database Error:", err);
                    res.status(500).send("Error saving data");
                    // mysqlServer.query("UPDATE volkyc set vname=?, contact=?,address=?,city=?,gender=?,dob=?,quali=?,occu=?,info=?,picpath=?,idpath=? where emailid=?")
                    //,[]
                } else {
                    res.send("Volunteer data saved successfully!");
                }
            }
        );
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.post("/fetch-record", function (req, resp) {
    ukEmail = req.body.ukEmail;
    console.log("Received data:", req.body.ukEmail);  //Debugging
    // let email = req.body.ukEmail;  //Ensure correct data access

    mysqlServer.query("Select * from volkyc where emailid = ?", [req.body.ukEmail], function (err, result) {
        if (err) {
            console.error(err);
            resp.send({ error: "Database error" });
        } else if (result.length == 0) {
            console.log(JSON.stringify(result))
            console.log(result)
            resp.send({ error: "No data found" });
        } else {
            resp.send(result); // Fix: Send JSON response
        }
    })
})

app.post("/update-kyc", async function (req, res) {
    try {

        if(req.files==null){
            file
        }
        let fileName1;
        if (req.files != null) {
            fileName1 = req.files.ukProfPic;
            let locationToSave = __dirname + "/public/uploads/" + fileName1;

            await req.files.ukProfPic.mv(locationToSave);

            try {
                let result = await cloudinary.uploader.upload(locationToSave);
                fileName1 = result.url;
                //console.log("Uploaded file URL : ", fileName1);
            } catch (uploadError) {
                console.error("Cloudinary Upload Error : ", uploadError);
                res.send("Error uploading file to Cloudinary.")
            }
        }
        else {
            fileName1 = "noPic.jpg";
        }


        let fileName2;
        if (req.files != null) {
            fileName2 = req.files.ukAdharPic;
            let locationToSave1 = __dirname + "/public/uploads/" + fileName2;

            await req.files.ukProfPic.mv(locationToSave1);

            try {
                let result1 = await cloudinary.uploader.upload(locationToSave1);
                fileName2 = result1.url;
                //console.log("Uploaded file URL : ", fileName2);
            } catch (uploadError) {
                console.error("Cloudinary Upload Error : ", uploadError);
                res.send("Error uploading file to Cloudinary.")
            }
        }
        else {
            fileName2 = "noPic1.jpg";
        }
        // Insert data into MySQL
        mysqlServer.query(
            "UPDATE volkyc SET vname=?, contact=?, address=?, city=?, gender=?, dob=?, quali=?, occu=?, info=?, picpath=?, idpath=? WHERE emailid=?",
            [
                req.body.ukName,        
                req.body.ukCnt,         
                req.body.ukAdd,         
                req.body.ukCity,        
                req.body.ukGndr,        
                req.body.ukDob,        
                req.body.ukQual,       
                req.body.ukOccu,        
                req.body.ukOtherInfo,   
                fileName1,              
                fileName2,              
                req.body.ukEmail        
            ],
            function (err, result) {
                //console.log(res.body);
                if (err == null) {
                    if (result.affectedRows == 1) {
                        res.send("Volunteer Record Updated Successfully !!")
                    }
                    else {
                        res.send("Invalid EmailID ")
                    }
                } else {
                    res.send(err.message);
                }
            }
        );
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/save-client", function (req, res) {
    try {
        // Check if email already exists
        mysqlServer.query(
            "SELECT email FROM cprofile WHERE email = ?",
            [req.body.cEmail],
            function (err, results) {
                if (err) {
                    console.error("Database Error:", err);
                    return res.status(500).send("Error checking existing record");
                }

                if (results.length > 0) {
                    // If email exists, update the existing record
                    mysqlServer.query(
                        "UPDATE cprofile SET name=?, business=?, bprofile=?, address=?, city=?, contact=?, idproof=?, idnumber=?, info=? WHERE email=?",
                        [
                            req.body.cName,
                            req.body.cFirm,
                            req.body.busProf,
                            req.body.cAdd,
                            req.body.cCity,
                            req.body.cCnt,
                            req.body.cProof,
                            req.body.cNum,
                            req.body.cOtherInfo,
                            req.body.cEmail,
                        ],
                        function (updateErr, result) {
                            if (updateErr) {
                                console.error("Database Error:", updateErr);
                                return res.status(500).send("Error updating record");
                            }
                            res.send("Profile updated successfully!");
                        }
                    );
                } else {
                    // If email doesn't exist, insert a new record
                    mysqlServer.query(
                        "INSERT INTO cprofile (email, name, business, bprofile, address, city, contact, idproof, idnumber, info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                            req.body.cEmail,
                            req.body.cName,
                            req.body.cFirm,
                            req.body.busProf,
                            req.body.cAdd,
                            req.body.cCity,
                            req.body.cCnt,
                            req.body.cProof,
                            req.body.cNum,
                            req.body.cOtherInfo,
                        ],
                        function (insertErr, result) {
                            if (insertErr) {
                                console.error("Database Error:", insertErr);
                                return res.status(500).send("Error saving data");
                            }
                            res.send("Client data saved successfully!");
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.post("/change-client", function (req, res) {
    try {
        // Check if the email exists in the database
        mysqlServer.query(
            "SELECT email FROM cprofile WHERE email = ?",
            [req.body.cEmail],
            function (err, results) {
                if (err) {
                    console.error("Database Error:", err);
                    return res.status(500).send("Error checking existing record");
                }

                if (results.length === 0) {
                    return res.status(404).send("No record found for the given Email ID");
                }

                // Update the record if email exists
                mysqlServer.query(
                    "UPDATE cprofile SET name=?, business=?, bprofile=?, address=?, city=?, contact=?, idproof=?, idnumber=?, info=? WHERE email=?",
                    [
                        req.body.cName,
                        req.body.cFirm,
                        req.body.busProf,
                        req.body.cAdd,
                        req.body.cCity,
                        req.body.cCnt,
                        req.body.cProof,
                        req.body.cNum,
                        req.body.cOtherInfo,
                        req.body.cEmail,
                    ],
                    function (updateErr, result) {
                        if (updateErr) {
                            console.error("Database Error:", updateErr);
                            return res.status(500).send("Error updating data");
                        }

                        if (result.affectedRows > 0) {
                            res.send("Profile updated successfully!");
                        } else {
                            res.status(400).send("Update failed");
                        }
                    }
                );
            }
        );
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/search-record", function (req, resp) {
    cEmail = req.body.cEmail;
    console.log("Received data:", req.body.cEmail);  
    // let email = req.body.ukEmail;  

    mysqlServer.query("Select * from cprofile where email = ?", [req.body.cEmail], function (err, result) {
        if (err) {
            console.error(err);
            resp.send({ error: "Database error" });
        } else if (result.length == 0) {
            console.log(JSON.stringify(result))
            console.log(result)
            resp.send({ error: "No data found" });
        } else {
            resp.send(result); 
        }
    })
})

app.post("/publish-job", function(req, resp){
    let clientid = req.body.clientid;
    let cTitle = req.body.cTitle;
    let cJobType = req.body.cJobType;
    let fAdd = req.body.fAdd;
    let fCity = req.body.fCity;
    let fEdu = req.body.fEdu;
    let fNum = req.body.fNum;

    //console.log("Received data:", req.body);  

    mysqlServer.query(
        "INSERT INTO JOBS (cid, jobtitle, jobtype, address, city, edu, contact) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [clientid, cTitle, cJobType, fAdd, fCity, fEdu, fNum],
        function (err, result) {
            if (err) {
                console.error(err);
                resp.send( err+ "Database error" );
            } else {
                resp.send("Job published successfully!");
            }
        }
    );
})

app.get("/all-records",function(req,resp)
{
    mysqlServer.query("select * from userInfo",function(err,result)
    {
        // console.log(result);
        resp.send(result);
    })
})

app.get("/update-status", function (req, resp) {
    let email = req.query.email;
    let status = req.query.status;

    mysqlServer.query("UPDATE userInfo SET statuss = ? WHERE email = ?",
        [status, email],
        function (err, result) {
            if (err) {
                resp.send("Error updating status: " + err.message);
            } else {
                //console.log("Rows affected successfully ");
                if (result.affectedRows > 0) {
                    resp.send(status == 1 ? "User blocked successfully" : "User resumed successfully");
                } else {
                    resp.send("No user found with this email.");
                }
            }
        }
    );
});

app.get("/vol-records",function(req,resp)
{
    mysqlServer.query("select * from volkyc",function(err,result)
    {
        //console.log(result);
        resp.send(result);
    })
})

app.get("/client-records",function(req,resp)
{
    mysqlServer.query("select * from cprofile",function(err,result)
    {
        //console.log(result);
        resp.send(result);
    })
})

app.get("/get-records",function(req,resp)
{
    // let Emailid = req.query.EmailID; // Fetch cid from query parameters

    if (!req.query.EmailID) {
        console.log(req.query.EmailID+" 1")
        resp.send("Missing Email ID parameter"); // Handle missing cid
    }
    else{
    mysqlServer.query("select * from JOBS where cid=?",[req.query.EmailID],function(err,result)
    {
        if (err) {
            return resp.send(err);
        }
        resp.send(result);
    })}
})

//------------access all cities of client post
app.get("/all-records-city", function (req, resp) {
    mysqlServer.query("select distinct city from JOBS ", function (err, result) {
        resp.send(result);
    })
})
//-----------access all job titles of client post
app.get("/all-records-title", function (req, resp) {
    mysqlServer.query("select distinct jobtitle from JOBS ", function (err, result) {
        resp.send(result);
    })
})

// Add this endpoint to your server.js
app.get("/admin/all-user-data", function(req, resp) {
    // Query to get all user data with their respective profile details
    const query = `
        SELECT 
            u.email,
            u.dropdown as role,
            u.statuss as status,
            u.pwd as password,  
            CASE 
                WHEN u.dropdown = 'Volunteer' THEN v.vname
                WHEN u.dropdown = 'Client' THEN c.name
                ELSE 'Admin'
            END as name,
            CASE 
                WHEN u.dropdown = 'Volunteer' THEN v.contact
                WHEN u.dropdown = 'Client' THEN c.contact
                ELSE 'N/A'
            END as contact,
            CASE 
                WHEN u.dropdown = 'Volunteer' THEN v.address
                WHEN u.dropdown = 'Client' THEN c.address
                ELSE 'N/A'
            END as address,
            CASE 
                WHEN u.dropdown = 'Volunteer' THEN v.city
                WHEN u.dropdown = 'Client' THEN c.city
                ELSE 'N/A'
            END as city,
            CASE 
                WHEN u.dropdown = 'Volunteer' THEN v.gender
                WHEN u.dropdown = 'Client' THEN 'N/A'
                ELSE 'N/A'
            END as gender,
            CASE 
                WHEN u.dropdown = 'Volunteer' THEN v.dob
                WHEN u.dropdown = 'Client' THEN 'N/A'
                ELSE 'N/A'
            END as dob,
            CASE 
                WHEN u.dropdown = 'Volunteer' THEN v.quali
                WHEN u.dropdown = 'Client' THEN 'N/A'
                ELSE 'N/A'
            END as qualification,
            CASE 
                WHEN u.dropdown = 'Volunteer' THEN v.occu
                WHEN u.dropdown = 'Client' THEN c.business
                ELSE 'N/A'
            END as occupation,
            CASE 
                WHEN u.dropdown = 'Volunteer' THEN v.info
                WHEN u.dropdown = 'Client' THEN c.info
                ELSE 'N/A'
            END as additional_info,
            CASE 
                WHEN u.dropdown = 'Volunteer' THEN v.picpath
                WHEN u.dropdown = 'Client' THEN 'N/A'
                ELSE 'N/A'
            END as profile_pic,
            CASE 
                WHEN u.dropdown = 'Volunteer' THEN v.idpath
                WHEN u.dropdown = 'Client' THEN 'N/A'
                ELSE 'N/A'
            END as id_proof,
            u.dropdown = 'Admin' as isAdmin
        FROM userInfo u
        LEFT JOIN volkyc v ON u.email = v.emailid
        LEFT JOIN cprofile c ON u.email = c.email
        ORDER BY isAdmin DESC, u.dropdown, name
    `;

    mysqlServer.query(query, function(err, results) {
        if (err) {
            console.error("Error fetching all user data:", err);
            resp.status(500).json({ error: err.message });
        } else {
            resp.json(results);
        }
    });
});


