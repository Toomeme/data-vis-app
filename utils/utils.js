const { response } = require('express');

//function to remove blank entries
const removeNullUndefined = obj => Object.entries(obj).reduce((a, [k, v]) => (v == null ? a : (a[k] = v, a)), {});
//function to add new k/v pairs to an object
const add = (obj, k, v) => Object.assign(obj, obj[k]
    ? { [k]: [].concat(obj[k], v) }
    : { [k]: v });

const query = require('./queryAPI');
// In case you don't have top level await yet
async function start(baseURL) {
    const sharePointSite = await query.queryGraphApi(baseURL);
    //console.log(sharePointSite);
    return sharePointSite;
}

const getDaysPerMonth = (month, year) => {
    days = new Date(year, month, 0).getDate();
    return parseInt(days);
};

function breakdownToDays(ob, month) {

    // Create our number formatter.
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    //get keys from the object we passed in
    keysToChange = Object.keys(ob);
    //modify any key that contains a dollar amount
    keysToChange.forEach(key => {
        if (ob[key]) {
            valueArray = ob[key];
            valueArray.forEach((number, index) => {
                if (number.includes('$')) {
                    //strip any character that isnt a number or decimal point
                    var string = number.replace(/[^0-9.]/g, '');
                    //parse into an int
                    var backToNumber = parseInt(string);
                    //divide by days in the month we passed in, rounded to nearest tenth, then formatted to USD
                    var dollarAmount = formatter.format(Math.round((backToNumber / getDaysPerMonth(month, 2024)) * 100.0) / 100.0);
                    valueArray[index] = dollarAmount;
                }
            });
        }
    });
    var daysPerMonth = getDaysPerMonth(month, 2024);
    var entryLength = -1;
    for (const [key, value] of Object.entries(ob)) {
        entryLength = value.length;
        for (var i = 0; i < daysPerMonth; i++) {
            var newKey = `${key}-${i + 1}`;
            add(ob, newKey, value);
        }
        delete ob[key];
    };
    if (entryLength > 0) {
        for (var i = 0; i < daysPerMonth; i++) {
            //add dates
            var newDate = `Date-${i + 1}`;
            let date = `${month}/${i + 1}/2024`;
            for (var k = 0; k < entryLength; k++) {
                add(ob, newDate, date)
            }
        }
    };
    return ob;

}

function createKeyValuePairs(sheet, table) {
    let apiData = {};
    let baseURL = `/sites/a88811de-8894-4bd9-9931-73feea44227b/drives/b!3hGIqJSI2UuZMXP-6kQie5JM6iWqaKZBkLyQBNo792_M0fOy6sZmSYcsM2DcKSp5/items/016J73M3IDZ32GHELGJFH2ARVWF7KWGBXJ/workbook/worksheets/{${sheet}}/tables/{${table}}/range?$select=text`;
    start(baseURL).then((response) => { apiData = response; console.log(apiData) });
    let data = [
        [
            "Line Item",
            "PO FY24 Approved",
            "EG Planned to spend",
            "Amount paid",
            "FY 24Difference Accting Approved vs. EG Planned to spend",
            "FY24 Difference EG Planned to spendvs. Amt paid",
            "Percentage of Budget"
        ],
        [
            "Advertising - 51000",
            "$2,982,600.00",
            "$3,309,934.62",
            "$2,503,049.51",
            "-$327,334.62",
            "$806,885.11",
            "81%"
        ],
        [
            "Books & Program Supplies  - 54000",
            "$0.00",
            "$0.00",
            "$0.00",
            "$0.00",
            "$0.00",
            "0%"
        ],
        [
            "Dues & Fees - 57000",
            "$0.00",
            "$0.00",
            "$0.00",
            "$0.00",
            "$0.00",
            "0%"
        ],
        [
            "Entertainment Expense - 58500",
            "$4,000.00",
            "$7,000.00",
            "$6,469.25",
            "-$3,000.00",
            "$530.75",
            "0%"
        ],
        [
            "Office Expense - 63060",
            "$7,500.00",
            "$4,500.00",
            "$2,266.00",
            "$3,000.00",
            "$2,234.00",
            "0%"
        ],
        [
            "Postage - 63070",
            "$96,240.00",
            "$73,840.00",
            "$37,212.30",
            "$22,400.00",
            "$36,627.70",
            "3%"
        ],
        [
            "Printing/Mailing Service - 65200",
            "$130,815.00",
            "$99,402.85",
            "$56,532.48",
            "$31,412.15",
            "$42,870.37",
            "4%"
        ],
        [
            "Professional Fees - Consulting - 66030",
            "$392,265.00",
            "$374,905.00",
            "$260,023.95",
            "$17,360.00",
            "$114,881.05",
            "11%"
        ],
        [
            "Promotion - 66200",
            "$4,000.00",
            "$4,000.00",
            "$3,511.52",
            "$0.00",
            "$488.48",
            "0%"
        ],
        [
            "Staff Professional Development - 70000",
            "$2,000.00",
            "$2,000.00",
            "$0.00",
            "$0.00",
            "$2,000.00",
            "0%"
        ],
        [
            "Student Expense - 71000",
            "$43,950.00",
            "$43,950.00",
            "$9,316.00",
            "$0.00",
            "$34,634.00",
            "1%"
        ],
        [
            "Travel - 77000",
            "$2,000.00",
            "$1,250.00",
            "$562.00",
            "$750.00",
            "$688.00",
            "0%"
        ],
        [
            "Spend (not including advertising)",
            "$682,770.00",
            "$610,847.85",
            "$375,893.50",
            "$71,922.15",
            "$234,954.35",
            "19%"
        ],
        [
            "Spend (including advertising)",
            "$3,665,370.00",
            "$3,920,782.47",
            "$2,878,943.01",
            "-$255,412.47",
            "$1,041,839.46",
            "100%"
        ]
    ];
    //define new object
    const o = {};

    //define arrays from data, and init results array
    var keyArray = data[0],
        result = [],
        slicedData = data.slice(1),
        dataFlat = slicedData.flat(),
        length = data.length - 1;

    //take as many elements of the flattened array as there are object keys, offset by current position, then push to results
    for (var row = 0; row < length; row++) {
        var array2 = dataFlat.slice(keyArray.length * (row + 1));
        var array2Sliced = array2.slice(0, keyArray.length);
        result.push(array2Sliced);
    }
    //for as many rows as there are in the table (results length), add a k/v pair to the object as long as it's not undefined
    result.forEach((element) => {
        for (var i = 0; i < keyArray.length; i++) {
            if (element[i] !== undefined) {
                add(o, keyArray[i].toString(), element[i]);
            }
        }
    }
    );
    //trim empty entries and output our object
    var newObj = removeNullUndefined(o);

    return newObj;
};

module.exports = { getDaysPerMonth, createKeyValuePairs, breakdownToDays };