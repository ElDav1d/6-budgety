// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value, date) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.date = date;
        this.percentage = -1;
    };

    var Income = function (id, description, value, date) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.date = date;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var calculateTotal = function (type) {
        var sum = 0;

        data.allItems[type].forEach(function (current) {
            sum = sum + current.value;
        })

        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 // not zero but minus one => has value but "doesn't exist"
    }

    return {
        addItem: function (type, des, val, date) {
            var newItem, ID;

            // ID = last ID + 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val, date);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val, date);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            // FROM ctrlDeleteItem => budgetCtrl.deleteItem(type, ID);
            // splitID = itemID.split('-'); // inc-1.split('-') = ['inc','1'];
            // type = splitID[0]; // type = 'inc'
            // ID = parseInt(splitID[1]); // ID = '1'

            // id = 6
            // data.allItems[type][id]

            ids = data.allItems[type].map(function (current) {
                return current.id;
            })

            // ids = [1,2,4,6,8]
            // index = 3
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },

        testing: function () {
            console.log(data);
        }
    };

})();

// UI CONTROLLER
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec, sign;
        /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands

        2310.4567 -> + 2,310.46
        2000 ->      + 2,000.00
        */

        num = Math.abs(num);  // this method gives an absoulte number, - 1 converts to 1
        num = num.toFixed(2); // this method rounds and converts numbers in strings!!

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 200310 -> output 200,310
        }

        dec = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+';
        return sign + ' ' + int + '.' + dec;
    };

    var formatItemDateArray = function (array) {
        return array.map(function (item) { return item < 10 ? '0' + item : item })
    };

    var formatItemDate = function (date) {
        var dateArray = [(date.getMonth() + 1), date.getUTCDate(), date.getFullYear()];

        return formatItemDateArray(dateArray).join('/');
    };

    var formatItemTime = function (date) {
        var timeArray = [date.getHours(), date.getMinutes(), date.getSeconds()];

        return formatItemDateArray(timeArray).join(':');
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getinput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc (income) or exp (expense)
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
                date: new Date()
            }
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item" id="inc-%id%"><div class="item__description">%description%</div><div class="flex-right"><div class="item__date"><small>%date%</small><small>%time%</small></div><div class="item__value"><span class="item__value-number">%value%</span></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';


            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item" id="exp-%id%"><div class="item__description">%description%</div><div class="flex-right"><div class="item__date"><small>%date%</small><small>%time%</small></div><div class="item__value"><span class="item__value-number">%value%</span><span class="item__percentage">21%</span></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%date%', formatItemDate(obj.date));
            newHtml = newHtml.replace('%time%', formatItemTime(obj.date));
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {
            var element = document.getElementById(selectorID)
            element.parentNode.removeChild(element);
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            // fields doesn't gives us an array but a list
            // lists are not arrays so doesn't have the methods of arrays
            // but have the numeric length property so are array-like
            // we can do a trick so store its content in an array
            // we can call the method slice on a list (or also in objects, or in the arguments object itself)
            // and store the resultant array in a new variable
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            })

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            // we don't the type
            // we have to infere if in order to show "+" or "-"
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc'); // no need to check type: is alaways positive
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp'); // no need to check type: is alaways negative

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = percentages[index] + '---';
                }
            });
        },

        displayMonth: function () {
            var now, month, months, year;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function () {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function (current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEvenListeners = function () {
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        // EVENT DELEGATION
        // think of event delegation as responsible parents and negligent children
        // the parents are basically gods, and the children have to listen to whatever the parents say
        // if we add more children (more inputs), the parents stay the same
        // they were there from the beginning or, in other words, on page load.
        // it can be identified with event.currentTarget 
        // we want the item to "behave", so we ask to his parent the item list (.container)
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var DOM = UICtrl.getDOMstrings();

    var updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget in the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        var input, newItem;

        // 1. Get the filled input data
        input = UICtrl.getinput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value, input.date);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the items
            UIController.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        // the event.target is a reference to the object that dispatched the event
        // it identifies the HTML element on which the event occurred.
        // the event is the 'click'
        // event.target identifies the HTML elements on which the event occurred
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // here we check if event.target matches the item
        // by coercing the pressence of an ID in four upper levels
        if (itemID) {
            splitID = itemID.split('-'); // inc-1.split('-') = ['inc','1'];
            type = splitID[0]; // type = 'inc'
            ID = parseInt(splitID[1]); // ID = '1'

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from the ui
            UICtrl.deleteListItem(itemID);

            // 3. update and show new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log('Started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            }); // not passing object, just reseting the labels content
            setupEvenListeners();
        }
    };

})(budgetController, UIController);

controller.init();