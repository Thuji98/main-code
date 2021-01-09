const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../db_config');

router.post('/delete', (req, res) => {
    const {table, column, id} = req.body;
    db.query('DELETE FROM ?? where ?? = ?', [table, column, id], (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    })
});
router.post('/edit', (req, res) => {
    const {table, column, id,  value, changed_column} = req.body;
    db.query('UPDATE ?? SET ?? = ? WHERE ??=?', [table, changed_column, value, column, id], (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    })
});

module.exports = router;