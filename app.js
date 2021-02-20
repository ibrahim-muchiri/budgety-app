
//BUDGET CONTROLLER
var budgetController = (function()
{
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage =-1; 

    };
    // class expense{
    //     constructor(id, description, value){
    //         this.id = id;
    //     this.description = description;
    //     this.value = value;
    //     this.percentage =-1;
    //     }
    // }
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }

        else {
            this.percentage = -1;
        }
    };
        Expense.prototype.getPercentage = function() {
            return this.percentage;
        };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;

    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        }),
        data.totals[type] = sum;
    }

    
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
        percentage: -1

    };

    return {
        addItem: function(type, des, val){
            var newItem, ID;
            //create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }

            else{
                ID = 0;
            }
            //create new item based on 'inc' or 'exp'            
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            //push it into the data structure
            data.allItems[type].push(newItem);
            //return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            //id = 6
            //data.allItem[type][id]......this method is followed when the array apears in order e.g 1 2 3 4
            //ids = [1 2 4 6 8]
            //index = 3

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1){
              data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {

            //calculate the total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we 
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);        

            } else{
                data.percentage = -1;
        
            }
            

        },

        calculatePercentage: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur){           
            return cur.getPercentage();
        });
        return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    
    }
})();


//UI CONTROLLER
var UIController = (function()
{
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainner: '.income__list', 
        expenseContainner: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        containner: '.containner',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    
    var formatNumber= function(num, type) {
        var numSplit, int, dec, type;
        /*
        + or - before number
        exactly 2 decimals points
        comma separating the thousands

        2310.4567 -> + 2,310.46
        2000 -> + 2,000.00
         */ 

         num = Math.abs(num);
         num = num.toFixed(2);

         numSplit = num.split('.');

         int = numSplit[0];
         if (int.length > 3) {
             int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510
             //output 23,510
         }
         dec = numSplit[1];

         return(type === 'exp' ? '-' : '+') + '' + int + '.' + dec;
     };
      
     var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
     

    return{
        getInput: function(){
            return{
                 type: document.querySelector(DOMstrings.inputType).value, //either inc or exp
             description: document.querySelector(DOMstrings.inputDescription).value,
             value: parseFloat(document.querySelector(DOMstrings.inputValue).value)

            };
            
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;
            //create HTML string with placeholder text
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainner;
                html = "<div class='item clearfix' id='income-%id%'><div class='item__description'>%description%</div><div class='right clearfix'><div class='item__value'>%value%</div><div class='item__delete'><button class='item__delete--btn'><i class='ion-ios-close-outline'></i></button></div></div>";
             }

            else if(type === 'exp') {
                element = DOMstrings.expenseContainner;

            html= "<div class='item clearfix' id='expense-%id%'><div class='item__description'>%description%</div><div class='right clearfix'><div class='item__value'>%value%</div><div class='item__percentage'>21%</div><div class='item__delete'><button class='item__delete--btn'><i class='ion-ios-close-outline'></i></button></div></div></div>";
        }
        //replace the placeholder text with actual data
        newHtml= html.replace('%id%', obj.id);
        newHtml= newHtml.replace('%description%', obj.description);
        newHtml= newHtml.replace('%value%', formatNumber(obj.value, type));

        //insert the Html into the DOM
        document.querySelector(element). insertAdjacentHTML('beforeEnd', newHtml);

    },

    deleteListItem: function(){
        var el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);

    },

    clearFields: function() {
        var fields, fieldsArr;
        fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
        fieldsArr = Array.prototype.slice.call(fields);

        fieldsArr.forEach(function(current, index, array) {
            current.value= "";

        });

    fieldsArr[0].focus();    

    },

    

    displayBudget: function(obj) {
        var type;
    obj.budget > 0 ? type = 'inc' : type = 'exp';
        document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

        //To display % sign
        if (obj.percentage > 0) {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
          }
          else{
              //To display this when the percentage is empty ---
            document.querySelector(DOMstrings.percentageLabel).textContent = '---';
          }

          },

          displayPercentages: function(percentages) {
              var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

          nodeListForEach(fields, function(current, index) {
            if (percentages[index] > 0) {
                current.textContent = percentages[index] + '%';                      
            }
            else {
                current.textContent = '---';
            }
        });
    },

          displayMonth: function() {
              var now, months, month, day, year;              
              months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
               'October', 'November', 'December'];
              now = new Date();             
              month = now.getMonth();
              day = now.getDate();
              //var chrismas = new Date(2016, 11, 25);

              year = now.getFullYear();
              document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + day + ' ' + year;
          },

          changedType: function() {
              var fields = document.querySelectorAll(
                  DOMstrings.inputType + ',' +
                  DOMstrings.inputDescription + ',' +
                  DOMstrings.inputValue);

                  nodeListForEach(fields, function(cur) {
                      cur.classList.toggle('red-focus');
                  });
                },
    
    getDOMstrings: function() {
        return DOMstrings;
    }
    }
})();


//GROBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl)
{
    
    var setUpEventListener = function()
    {
        var DOM = UICtrl.getDOMstrings ();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event)
    {
        if(event.keycode ===13 || event.which ===13)
        {
            ctrlAddItem();

        }
      
    });
    //Delete item using event delegation method
    document.querySelector(DOM.containner).addEventListener('click', ctrlDeleteItem);    
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.chengedType);
     };

    var updateBudget = function(){

    //1.calculate the budget
    budgetCtrl.calculateBudget();
    //2.return the budget
    budget = budgetCtrl.getBudget();
       

    //3. Display the budget on the user interface
    UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        //calculate the budget
        budgetCtrl.calculatePercentage();

        //read the percentage from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //update the UI with the new percentage
        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function()
    {
        var input, newItem;
        //1. Get the field input data
        input= UICtrl.getInput();

        if(input.description !=="" && !isNaN(input.value) && input.value > 0){
            //2. Add the item to the budget controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    //3. Add item to the UI
    UICtrl.addListItem(newItem, input.type);

    //4.clear all the fields
    UICtrl.clearFields();
      //5. Calculate and update the budget
      updateBudget();
      //calculate and update the percentages
      updatePercentages();    

    }

        };        
        
          //setting up delete event using event delegation 
        var ctrlDeleteItem = function(event){
            var itemID, splitID, type, ID;
         itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
         if(itemID){
             splitID = itemID.split('-');
             type = splitID[0];
             ID = parseInt(splitID[1]);

             //1.delete the item from the data structure
             budgetCtrl.deleteItem(type, ID);

             //2.delete the item from the UI
             UICtrl.deleteListItem(itemID);
             //3.update and show the new budget
             updateBudget();
              //4.calculate and update the percentages
             updatePercentages();
         }
        };


    return {
        init: function(){
            UICtrl.displayMonth();
        console.log("application has started");
        setUpEventListener();
        UICtrl.displayBudget( {
            budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
        });
        }
    }
    


})(budgetController,UIController);

controller.init();