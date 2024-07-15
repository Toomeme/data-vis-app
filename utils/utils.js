const query = require('./queryAPI');

//function to remove blank entries
const removeNullUndefined = obj => Object.entries(obj).reduce((a, [k, v]) => (v == null ? a : (a[k] = v, a)), {});
//function to add new k/v pairs to an object
const add = (obj, k, v) => Object.assign(obj, obj[k]
    ? { [k]: [].concat(obj[k], v) }
    : { [k]: v });
// In case you don't have top level await yet
function start(baseURL) {
    return new Promise(async (resolve, reject) => {
        try {
            const sharePointSite = await query.queryGraphApi(baseURL);
            resolve(sharePointSite);
        } catch (error) {
            reject(error);
        }
    });
}

function processArray(arr) {
    return arr.map(item => item.toString().replace('[', '').replace(']', ''));
}
function processData(report) {
    const result = [];
    const keys = Object.keys(report);

    keys.forEach(key => {
        if (Array.isArray(report[key])) {
            const processedArray = processArray(report[key]).map((item, index) => ({
                item_number: index + 1,
                [key.toLowerCase().trim().replace(/ /g, '_').replace(/"/g, '')]: item.replace(/"/g, '')
            }));
            
            processedArray.forEach(processedItem => {
                const existingItem = result.find(item => item.item_number === processedItem.item_number);
                if (existingItem) {
                    Object.assign(existingItem, processedItem);
                } else {
                    result.push(processedItem);
                }
            });
        }
    });

    return result;
}
/*function processData(report) {

    const reportKeys = report.keys;

    const lineItems = processArray(report["Line Item"]).map((item, index) => ({
        item_number: index + 1,
        line_item: item.replace(/"/g, '')
    }));

    const poFy24Approved = processArray(report["PO FY24 Approved"]).map((item, index) => ({
        item_number: index + 1,
        po_fy24_approved: item.replace(/"/g, '')
    }));

    const egPlannedToSpend = processArray(report["EG Planned to spend"]).map((item, index) => ({
        item_number: index + 1,
        eg_planned_to_spend: item.replace(/"/g, '')
    }));

    const amountPaid = processArray(report["Amount paid"]).map((item, index) => ({
        item_number: index + 1,
        amount_paid: item.replace(/"/g, '')
    }));

    const fy24DiffAcctingVsEgPlanned = processArray(report["FY 24 Difference Accting Approved vs. EG Planned to spend"]).map((item, index) => ({
        item_number: index + 1,
        fy_24_difference_accting_approved_vs_eg_planned_to_spend: item.replace(/"/g, '')
    }));

    const fy24DiffEgPlannedVsAmtPaid = processArray(report["FY24 Difference EG Planned to spend vs. Amt paid"]).map((item, index) => ({
        item_number: index + 1,
        fy24_difference_eg_planned_to_spend_vs_amt_paid: item.replace(/"/g, '')
    }));

    const percentageOfBudget = processArray(report["Percentage of Budget"]).map((item, index) => ({
        item_number: index + 1,
        percentage_of_budget: item.replace(/"/g, '')
    }));

    // Join data by item_number
    const result = lineItems.map(item => ({
        item_number: item.item_number,
        "Line Item": item.line_item,
        "PO FY24 Approved": poFy24Approved.find(po => po.item_number === item.item_number).po_fy24_approved,
        "EG Planned to spend": egPlannedToSpend.find(eg => eg.item_number === item.item_number).eg_planned_to_spend,
        "Amount paid": amountPaid.find(ap => ap.item_number === item.item_number).amount_paid,
        "FY 24 Difference Accting Approved vs. EG Planned to spend": fy24DiffAcctingVsEgPlanned.find(diff => diff.item_number === item.item_number).fy_24_difference_accting_approved_vs_eg_planned_to_spend,
        "FY24 Difference EG Planned to spend vs. Amt paid": fy24DiffEgPlannedVsAmtPaid.find(diff => diff.item_number === item.item_number).fy24_difference_eg_planned_to_spend_vs_amt_paid,
        "Percentage of Budget": percentageOfBudget.find(pob => pob.item_number === item.item_number).percentage_of_budget
    }));

    return result;
}

// Usage
/*fetchData().then(report => {
    const processedData = processData(report);
    console.log(processedData);
});*/


const getDaysPerMonth = (month, year) => {
    days = new Date(year, month, 0).getDate();
    return parseInt(days);
};

function breakdownToDays(ob, month) {

    /*// Create our number formatter.
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });*/
    //get keys from the object we passed in
    let keysToChange = Object.keys(ob);
    //modify any the value of key that contains a dollar amount
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
                    var dollarAmount = Math.round((backToNumber / getDaysPerMonth(month, 2024)) * 100.0) / 100.0;
                    valueArray[index] = dollarAmount;
                }

                else if (number.includes('%')) {
                    //strip any character that isnt a number or decimal point
                    var percentString = number.replace(/[^0-9.]/g, '');
                    //parse into an int
                    var percentToNumber = parseInt(percentString);
                    //divide by days in the month we passed in, rounded to nearest tenth, then formatted to USD
                    valueArray[index] = percentToNumber;
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

};

function useValue(data){
    //define new object
    const o = {};

    //define arrays from data, and init results array
    var keyArray = data[0],
        result = [],
        slicedData = data,
        dataFlat = slicedData.flat(),
        length = data.length - 1;

    //take as many elements of the flattened array as there are object keys, offset by current position, then push to results
    //this sucks btw, but the data we actually pulled is discrete arrays, so the other option was using spread/rest operators
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

async function createKeyValuePairs(item, sheet, table, doBreakdown, month) {
    //supports id key (128 bit hex) or name key (string)
    let baseURL = `/sites/a88811de-8894-4bd9-9931-73feea44227b/drives/b!3hGIqJSI2UuZMXP-6kQie5JM6iWqaKZBkLyQBNo792_M0fOy6sZmSYcsM2DcKSp5/items/${item}/workbook/worksheets/${sheet}/tables/${table}/range?$select=text`;
    try {
        //assign value once fetch completes
        let apiData = await start(baseURL);
        let data = apiData.text;
        //if we're breaking into days
        if (doBreakdown){
            let breakdownJSON = useValue(data);
            return breakdownToDays(breakdownJSON, month);
        }
        else{

            //get keys from the object we passed in
            let ob = useValue(data);
            //console.log(ob);
            let keysToChange = Object.keys(ob);
            //modify any the value of key that contains a dollar amount
            keysToChange.forEach(key => {
                if (ob[key]) {
                    valueArray = ob[key];
                    if (valueArray.constructor === Array){
                    valueArray.forEach((number, index) => {
                        if (number.includes('$')) {
                            //strip any character that isnt a number or decimal point
                            var string = number.replace(/[^0-9.]/g, '');
                            //parse into an int
                            var backToNumber = parseInt(string);
                            //divide by days in the month we passed in, rounded to nearest tenth, then formatted to USD
                            var dollarAmount = Math.round(backToNumber * 100.0) / 100.0;
                            valueArray[index] = dollarAmount;
                        }

                        else if (number.includes('%')) {
                            //strip any character that isnt a number or decimal point
                            var percentString = number.replace(/[^0-9.]/g, '');
                            //parse into an int
                            var percentToNumber = parseInt(percentString);
                            //divide by days in the month we passed in, rounded to nearest tenth, then formatted to USD
                            valueArray[index] = percentToNumber;
                        }
                    });
                }
            }
            });
        return processData(ob);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return {}; // Return an empty object in case of an error
    }
};



module.exports = { getDaysPerMonth, createKeyValuePairs, breakdownToDays };