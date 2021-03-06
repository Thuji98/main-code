const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../../db_config');
var fs = require("fs");
const bcrypt =require('bcrypt');

router.post('/add_new_cus_attribute', (req, res) => {
    const { attr_title } = req.body;
    db.query('INSERT INTO `custom_fields` SET ? ;', { custom_field_name: attr_title }, (error, result) => {
        if (error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    })
});

router.post('/attr_value', (req, res) => {
    const { custom_field_id, attr_value } = req.body;
    db.query('INSERT INTO `custom_field_values` SET ? ;', { custom_field_id, custom_field_value: attr_value }, (error, result) => {
        if (error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    })
});

router.post('/add_new_emergency_attribute', (req, res) => {
    var {isRequired, isMultivalued }=req.body;
    const { name, isPersonal} = req.body; 
    isRequired = (isRequired == null)? 0 : 1;
    isMultivalued = (isMultivalued == null)? 0 : 1;
    db.query('INSERT INTO `emergency_contact_items` SET ? ;', { eme_item_name: name, personal: isPersonal, is_required: isRequired, multivalued: isMultivalued }, (error, result) => {
        if (error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    })
});

router.post('/change_profile',(req, res)=>{
    const emp_id = req.session.emp_id;
    const {response,removeImage} = req.body;
    if(removeImage=="true"){
        fs.unlink("public\\img\\profile\\"+emp_id+".jpg", (delErr) => {
            if (delErr) console.log("image delete error",delErr);
            res.send("Image removed successfully.");
        });
    }else{
        fs.writeFile("public\\img\\profile\\"+emp_id+".jpg", new Buffer.from(response.split(",")[1], "base64"), 
        function(writeErr) {if(writeErr) console.log("write error",writeErr);});
        res.send("Image changed successfully.");
    }
    
});

router.post('/userEditDetails', async (req, res) => {
    var {user_name, first_name, last_name, password} = req.body;
    var emp_id = req.session.emp_id;
    db.query("select password from users where emp_id=? ",[emp_id], (err,result)=>{
        if(err) console.log({err})
        else{
            bcrypt.compare(password, result[0].password,(err,is_correct) =>{
                if (is_correct){
                    db.query('UPDATE users SET username=? where emp_id=? ; UPDATE employees SET firstname=?, lastname=? where emp_id=?; ', [user_name,emp_id, first_name, last_name,emp_id], (error, result2) => {
                        if(error) {
                            console.log('mysql error', error);
                        }else {
                            res.json({success:true});
                        }
                    })
                }else{
                    res.json({success:false,error:"INCORRECT PASSWORD"});
                }
            });
            
        }
    })

});


router.post('/userChangePassword', (req, res) => {
    const emp_id = req.session.emp_id;
    var {curr_pass, new_pass, confirm_pass} = req.body;
    if(new_pass === confirm_pass){
        db.query("select password from users where emp_id=? ",[emp_id], (err,result)=>{
            if(err) console.log({err})
            else{
                bcrypt.compare(curr_pass, result[0].password,(err,is_correct) =>{
                    console.log(is_correct)
                    if (is_correct){
                        bcrypt.hash(new_pass, 10, (err,hash_password) =>{
                            if (err) console.log(err);
                            else{
                                db.query('UPDATE users SET password=? where emp_id=? ;', [hash_password,emp_id], (error, result2) => {
                                    if(error) {
                                        console.log('mysql error', error);
                                        res.json({status: 0, result: "some error occured"})
                                    }else {
                                        res.json({status: 1, result: "Your password changed"})
                                    }
                                })
                            }
                        });
                    }else{
                        res.json({status: 0, result: "Your password do not match"})
                    }
                });
                
            }
        });

    }else{
        res.json({status: 0, result: "Your new password and confirmation password do not match"})
    }
});

router.post('/del_emp', (req, res) => {
    const {emp_id} = req.body;
    db.query('UPDATE employees SET status=0 WHERE emp_id=?', [emp_id], (error, result) => {
        if(error){
            console.log('mysql error', error);
        } 
        else {
            res.json({result});
        }
    })
});

module.exports = router;
