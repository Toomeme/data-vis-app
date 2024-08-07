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
            if (Array.isArray(valueArray)){
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