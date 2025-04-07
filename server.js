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

app.use(express.urlencoded(true));
app.use(fileUploader());

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
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
    const { sgnEmail, sgnPwd, dropdown1 } = req.query;

    // Step 1: Check if the email already exists
    mysqlServer.query("SELECT * FROM userInfo WHERE email = ?", [sgnEmail], function (err, results) {
        if (err) {
            console.log(err);
            return resp.send({ status: "error", message: "Database error" });
        }

        if (results.length > 0) {
            // Email already exists
            return resp.send({ status: "exists", message: "User already exists with this email." });
        }

        // Step 2: Insert new user
        mysqlServer.query("INSERT INTO userInfo (email, pwd, dropdown) VALUES (?, ?, ?)",
            [sgnEmail, sgnPwd, dropdown1], function (err, res2) {
                if (err) {
                    console.log(err);
                    return resp.send({ status: "error", message: "Signup failed. Try again." });
                }

                console.log("Data Saved");
                return resp.send({ status: "success", message: "Account created successfully. Login now." });
            });
    });
});

app.get("/user-login-page", function (req, resp) {
    let sgnEmail1 = req.query.sgnEmail1;
    let sgnPwd1 = req.query.sgnPwd1;

    mysqlServer.query("SELECT * from userInfo where email=? AND pwd=?", [sgnEmail1, sgnPwd1], function (err, resultArr) {
        if (err == null) {

            if (resultArr.length == 0)
                // resp.status(401).send("Invalid credentials");
                resp.send("Invalid User Id or Password");
            else if (resultArr[0].statuss == 0) {
                // resp.send("logged in successfully");
                resp.send(resultArr[0].dropdown);
            }
            else {
                resp.send("You are BLOCKED user !!");
            }
        }
        else {
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

app.get("/change-password", function (req, resp) {
    let dirName = __dirname;
    let fullpath = dirName + "/public/change-password.html";
    resp.sendFile(fullpath);
})

app.get("/client-page", function (req, resp) {
    //resp.send("New page !!!")
    let dirName = __dirname;
    let fullpath = dirName + "/public/client-profile.html";
    resp.sendFile(fullpath);
})

app.get("/client-dash", function (req, resp) {
    let dirName = __dirname;
    let fullpath = dirName + "/public/client-dash.html";
    resp.sendFile(fullpath);
})

app.get("/vol-dash", function (req, resp) {
    let dirName = __dirname;
    let fullpath = dirName + "/public/vol-dash.html";
    resp.sendFile(fullpath);
})

app.get("/job-post", function (req, resp) {
    let dirName = __dirname;
    let fullpath = dirName + "/public/post-job.html";
    resp.sendFile(fullpath);
})

app.get("/manage-job", function (req, resp) {
    let dirName = __dirname;
    let fullpath = dirName + "/public/job-manager.html";
    resp.sendFile(fullpath);
})

app.get("/admin-dash", function (req, resp) {
    let dirName = __dirname;
    let fullpath = dirName + "/public/admin-dash.html";
    resp.sendFile(fullpath);
})

app.get("/user-cntrl", function (req, resp) {
    let dirName = __dirname;
    let fullpath = dirName + "/public/user-controller.html";
    resp.sendFile(fullpath);
})

app.get("/vol-mngr", function (req, resp) {
    let dirName = __dirname;
    let fullpath = dirName + "/public/volu-manager.html";
    resp.sendFile(fullpath);
})

app.get("/client-mngr", function (req, resp) {
    let dirName = __dirname;
    let fullpath = dirName + "/public/client-manager.html";
    resp.sendFile(fullpath);
})

app.get("/admin-analytics", function (req, resp) {
    let dirName = __dirname;
    let fullpath = dirName + "/public/analytics-dashboard.html";
    resp.sendFile(fullpath);
})

app.post("/register-vol", async function (req, resp) {
    let ukEmail = req.body.ukEmail;
    let ukName = req.body.ukName;
    let ukCnt = req.body.ukCnt;
    let ukAdd = req.body.ukAdd;
    let ukCity = req.body.ukCity;
    let ukGender = req.body.ukGender;
    let ukDob = req.body.ukDob;
    let ukQual = req.body.ukQual;
    let ukOccu = req.body.ukOccu;
    let ukOtherInfo = req.body.ukOtherInfo;
    let fileNameProfPic;
    let fileNameID;

    mysqlServer.query("select email from userInfo  where email=?", [ukEmail], async function (err, resMain) {
        // console.log("resultMain "+JSON.stringify(resMain))
        try {
            // console.log(ukEmail)
            if (!ukEmail) {
                resp.send("Please enter valid email.")
            }
            else {
                if (resMain[0].email == ukEmail) {
                    // console.log(err + "1")
                    // resp.send("Email is verified!")
                    if (!ukEmail || !ukName || !ukCnt || !ukAdd || !ukCity || !ukDob
                        || ukOccu == "Select" || ukQual == "Select"
                        || ukGender == "Select") {
                        resp.send("Enter valid details!")
                        // console.log(err + "2")
                    }
                    else {
                        // console.log(err + "3")
                        if (!req.files) {
                            fileNameProfPic = "nopic.jpg";
                            fileNameID = "nopic2.jpg";
                            resp.send("files not uploaded")
                            // console.log(fileNameID + " " + fileNamePpic)
                            // console.log(err + "4")
                        }
                        else {
                            // console.log(err + "5")
                            {
                                fileNameProfPic = req.files.ukProfPic.name;
                                let locationToSaveProfPic = __dirname + "/public/uploads/" + fileNameProfPic;//full ile path
                                await req.files.ukProfPic.mv(locationToSaveProfPic);//saving file in uploads folder

                                //saving ur file/pic on cloudinary server
                                await cloudinary.uploader.upload(locationToSaveProfPic).then(function (picUrlResultPpic) {
                                    fileNameProfPic = picUrlResultPpic.url;   //will give u the url of ur pic on cloudinary server
                                    // console.log(fileNameProfPic);
                                });
                                fileNameID = req.files.ukAdharPic.name;
                                let locationToSaveID = __dirname + "/public/uploads/" + fileNameID;//full ile path
                                await req.files.ukAdharPic.mv(locationToSaveID);//saving file in uploads folder

                                // 2 second delay for the next upload
                                await new Promise(resolve => setTimeout(resolve, 2000));

                                //saving ur file/pic on cloudinary server
                                await cloudinary.uploader.upload(locationToSaveID).then(function (picUrlResultIDproof) {
                                    fileNameID = picUrlResultIDproof.url;   //will give u the url of ur pic on cloudinary server
                                    // console.log(fileNameID);
                                    // console.log(err + "6")
                                });
                                mysqlServer.query("select email,emailid from userInfo INNER JOIN volkyc ON userInfo.email=volkyc.emailid where volkyc.emailid=?",
                                    [ukEmail], function (err, res) {
                                        // console.log(err + "7")
                                        // console.log(res)
                                        if (res.length === 0) {
                                            // console.log(err + "8")
                                            mysqlServer.query("INSERT INTO volkyc(emailid, vname, contact, address, city, gender, dob, quali, occu, info, picpath, idpath) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)", [
                                                ukEmail,
                                                ukName,
                                                ukCnt,
                                                ukAdd,
                                                ukCity,
                                                ukGender,
                                                ukDob,
                                                ukQual,
                                                ukOccu,
                                                ukOtherInfo,
                                                fileNameProfPic,
                                                fileNameID
                                            ], function (err, res2) {
                                                if (!err) {
                                                    // console.log(err + "9")
                                                    resp.send("KYC Completed successfully!")
                                                }
                                                // else { console.log(err + "10 main") }
                                            })

                                        }
                                        else {

                                            resp.send("Please enter the registered Email address and try again.")
                                            // console.log(err + "11")
                                        }
                                    })

                            }

                        }


                    }
                }
                else {
                    resp.send("Please enter registered email!")
                    // console.log(err + "12")
                }
            }
        }
        catch {
            resp.send("Main Cloud Error!")
            console.error()
        }

    })
});


app.post("/fetch-record", function (req, resp) {
    ukEmail = req.body.ukEmail;
    console.log("Received data:", req.body.ukEmail);  //Debugging
    // let email = req.body.ukEmail;  //Ensure correct data access
    mysqlServer.query("select * from volkyc where emailid=?", [ukEmail], function (err, res) {
        if (err) {
            console.log(err + " error bck")
            console.log("result " + res)
            resp.send(err + " Error!")
        }
        else {
            if (resp.affectedRows === 0) {
                // console.log(err + " error bck else then if");
                // console.log("result else then if" + res);
                resp.send("Complete KYC First!");
            } else {
                resp.send(res);
            }
        }
    })
})

app.post("/update-kyc", async function (req, resp) {
    let ukEmail = req.body.ukEmail;
    let ukName = req.body.ukName;
    let ukCnt = req.body.ukCnt;
    let ukAdd = req.body.ukAdd;
    let ukCity = req.body.ukCity;
    let ukGender = req.body.ukGender;
    let ukDob = req.body.ukDob;
    let ukQual = req.body.ukQual;
    let ukOccu = req.body.ukOccu;
    let ukOtherInfo = req.body.ukOtherInfo;
    let ukProfPic = req.files ? req.files.ukProfPic : null;
    let ukAdharPic = req.files ? req.files.ukAdharPic : null;


    let fileNameProfPic;
    let fileNameID;

    let NewukEmail;
    let NewukName;
    let NewukCnt;
    let NewukAdd;
    let NewukCity;
    let NewukGender;
    let NewukDob;
    let NewukQual;
    let NewukOccu;
    let NewukOtherInfo;
    let NewukProfPic;
    let NewukAdharPic;

    mysqlServer.query("select * from volkyc where emailid=?", [ukEmail], function (err, res3) {
        // console.log(res3)
        if (res3.length == 0) {
            resp.send("Fill the required data")
        }
        else {
            NewukEmail = res3[0].emailid;
            NewukName = res3[0].fullname;
            NewukCnt = res3[0].contact;
            NewukAdd = res3[0].address;
            NewukCity = res3[0].city;
            NewukGender = res3[0].gender;
            NewukDob = res3[0].dob;
            NewukQual = res3[0].quali;
            NewukOccu = res3[0].occu;
            NewukOtherInfo = res3[0].info;
            NewukProfPic = res3[0].picpath;
            NewukAdharPic = res3[0].idpath;
            // checking if any value is null
            NewukEmail = (ukEmail != null && ukEmail !== '') ? ukEmail : NewukEmail;
            NewukName = (ukName != null && ukName !== '') ? ukName : NewukName;
            NewukCnt = (ukCnt != null && ukCnt !== '') ? ukCnt : NewukCnt;
            NewukAdd = (ukAdd != null && ukAdd !== '') ? ukAdd : NewukAdd;
            NewukCity = (ukCity != null && ukCity !== '') ? ukCity : NewukCity;
            NewukGender = (ukGender != null && ukGender !== '') ? ukGender : NewukGender;
            NewukDob = (ukDob != null && ukDob !== '') ? ukDob : NewukDob;
            NewukQual = (ukQual != null && ukQual !== '') ? ukQual : NewukQual;
            NewukOccu = (ukOccu != null && ukOccu !== '') ? ukOccu : NewukOccu;
            NewukOtherInfo = (ukOtherInfo != null && ukOtherInfo !== '') ? ukOtherInfo : NewukOtherInfo;
            NewukProfPic = (ukProfPic != null && ukProfPic !== '') ? ukProfPic : NewukProfPic;
            NewukAdharPic = (ukAdharPic != null && ukAdharPic !== '') ? ukAdharPic : NewukAdharPic;
        }
    })

    mysqlServer.query("select email from userInfo where email=?", [ukEmail], async function (err, resMain) {
        // console.log("resultMain "+JSON.stringify(resMain))
        try {
            // console.log(ukEmail)
            if (!ukEmail) {
                resp.send("Please enter valid email.")
            }
            else {
                if (resMain[0].email == ukEmail) {
                    // console.log(err+"1")
                    // resp.send("Email is verified!")
                    if (!ukEmail) {
                        resp.send("Enter valid details!")
                        // console.log(err+"2")
                    }
                    else {
                        // console.log(err+"3")
                        if (!req.files) {
                            fileNameProfPic = "uploads/noPic.jpg";
                            fileNameID = "uploads/noPic1.jpg";
                            if (!req.files || !ukProfPic || !ukAdharPic) {
                                return resp.status(400).send("Files not uploaded");
                            }

                            // console.log(err+"4")
                        }
                        else {
                            // console.log(err + "5")
                            {
                                NewukProfPic = req.files.ukProfPic.name;
                                let locationToSavePpic = __dirname + "/public/uploads/" + NewukProfPic;//full ile path
                                await req.files.ukProfPic.mv(locationToSavePpic);//saving file in uploads folder

                                //saving ur file/pic on cloudinary server
                                await cloudinary.uploader.upload(locationToSavePpic).then(function (picUrlResultPpic) {
                                    NewukProfPic = picUrlResultPpic.url;   //will give u the url of ur pic on cloudinary server
                                    // console.log(NewukProfPic);
                                });
                                NewukAdharPic = req.files.ukAdharPic.name;
                                let locationToSaveID = __dirname + "/public/uploads/" + NewukAdharPic;//full ile path
                                await req.files.ukAdharPic.mv(locationToSaveID);//saving file in uploads folder

                                // 2 second delay for the next upload
                                await new Promise(resolve => setTimeout(resolve, 2000));

                                //saving ur file/pic on cloudinary server
                                await cloudinary.uploader.upload(locationToSaveID).then(function (picUrlResultIDproof) {
                                    NewukAdharPic = picUrlResultIDproof.url;   //will give u the url of ur pic on cloudinary server
                                    // console.log(NewukAdharPic);
                                    // console.log(err + "6")
                                });
                                mysqlServer.query("select email,emailid from userInfo INNER JOIN volkyc ON userInfo.email=volkyc.emailid where volkyc.emailid=?",
                                    [ukEmail], function (err, res) {
                                        // console.log(err + "7")
                                        // console.log(res)
                                        if (res.length != 0) {
                                            // console.log(err + "8")
                                            mysqlServer.query("UPDATE volkyc set vname=?, contact=?, address=?, city=?, gender=?, dob=?, quali=?, occu=?, info=?, picpath=?, idpath=? WHERE emailid=?", [
                                                NewukName,
                                                NewukCnt,
                                                NewukAdd,
                                                NewukCity,
                                                NewukGender,
                                                NewukDob,
                                                NewukQual,
                                                NewukOccu,
                                                NewukOtherInfo,
                                                NewukProfPic,
                                                NewukAdharPic,
                                                ukEmail
                                            ], function (err, res2) {
                                                if (!err) {
                                                    // console.log(err + "9")
                                                    resp.send("KYC Updated successfully!")
                                                }
                                                // else { console.log(err + "10 main") }
                                            })

                                        }
                                        else {

                                            resp.send("Please enter the registered Email address and try again.")
                                            // console.log(err + "11")
                                        }
                                    })

                            }

                        }


                    }
                }
                else {
                    resp.send("Please enter registered email!")
                    // console.log(err + "12")
                }
            }
        }
        catch {
            resp.send("Main Cloud Error!")
            console.error()
        }

    })
});

// Change password API 
app.post("/change-password", function (req, res) {
    const { email, oldPassword, newPassword } = req.body;

    mysqlServer.query("SELECT * FROM userInfo WHERE email = ?", [email], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }

        if (results.length === 0) {
            return res.status(404).send("User not found");
        }

        if (results[0].pwd !== oldPassword) {
            return res.status(401).send("Old password is incorrect");
        }

        mysqlServer.query("UPDATE userInfo SET pwd = ? WHERE email = ?", [newPassword, email], function (err) {
            if (err) {
                console.error(err);
                return res.status(500).send("Error updating password");
            }

            return res.send("Password updated successfully");
        });
    });
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
    let email = req.body.cEmail;
    console.log("Received data:", req.body.cEmail);
      

    mysqlServer.query("Select * from cprofile where email = ?", [req.body.cEmail], function (err, result) {
        if (err) {
            console.error(err);
            resp.send({ error: "Database error" });
        } else if (result.affectedRows == 0) {
            console.log(JSON.stringify(result))
            console.log(result)
            resp.send({ error: "No data found" });
        } else {
            resp.send(result);
        }
    })
})

app.post("/publish-job", function (req, resp) {
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
                console.log(clientid+" email");
                console.error(err);
                resp.send(err + "Database error");
            } else {
                resp.send("Job published successfully!");
            }
        }
    );
})

app.get("/all-records", function (req, resp) {
    mysqlServer.query("select * from userInfo", function (err, result) {
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

app.get("/vol-records", function (req, resp) {
    mysqlServer.query("select * from volkyc", function (err, result) {
        //console.log(result);
        resp.send(result);
    })
})

app.get("/client-records", function (req, resp) {
    mysqlServer.query("select * from cprofile", function (err, result) {
        //console.log(result);
        resp.send(result);
    })
})

app.get("/get-records", function (req, resp) {
    // let Emailid = req.query.EmailID; // Fetch cid from query parameters

    if (!req.query.EmailID) {
        console.log(req.query.EmailID + " 1")
        resp.send("Missing Email ID parameter"); // Handle missing cid
    }
    else {
        mysqlServer.query("select * from JOBS where cid=?", [req.query.EmailID], function (err, result) {
            if (err) {
                return resp.send(err);
            }
            resp.send(result);
        })
    }
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

// Get all jobs (new endpoint needed)
app.get("/all-jobs", function (req, resp) {
    mysqlServer.query("SELECT * FROM JOBS", function (err, result) {
        resp.send(result);
    })
})

// Delete a job by ID
app.delete("/delete-job", function (req, resp) {
    const jobId = req.query.jobid;
    mysqlServer.query("DELETE FROM JOBS WHERE jobid = ?", [jobId], function (err, result) {
        if (err) {
            resp.status(500).send(err);
        } else {
            resp.send({ success: result.affectedRows > 0 });
        }
    });
});

// Add this endpoint to your server.js
app.get("/admin/all-user-data", function (req, resp) {
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

    mysqlServer.query(query, function (err, results) {
        if (err) {
            console.error("Error fetching all user data:", err);
            resp.status(500).json({ error: err.message });
        } else {
            resp.json(results);
        }
    });
});

// Count jobs posted by Client
app.post("/client/emailstatus",function(req,resp){
    clientid = req.body.clientid;
    mysqlServer.query("SELECT COUNT(*) AS total FROM JOBS WHERE cid = ?",[clientid],function(err,res){
        if(err){
            resp.send("Error! "+err)
        }
        else{
            resp.send("Total jobs posted: "+res[0].total)
        }
    })
})
