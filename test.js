function TestCase(name, method)
{
    this.name = name;
    this.method = method;
    this.fails = 0;
    this.runned = false;
    this.isExceptionExpected = false;

    this.run = function()
    {
        console.log("running test case: " + this.name);
        this.fails = 0;
        try
        {
            this.method(this);

            if (this.isExceptionExpected)
                this.fail("exception was expected!");
        }
        catch (ex)
        {
            if (!this.isExceptionExpected)
                this.fail("exception thrown: " + ex);
        }
        this.runned = true;
    }

    this.getResult = function()
    {
        return (this.fails === 0);
    }

    this.summarize = function()
    {
        if (!this.runned)
            throw "Test case: '" + this.name + "' does not runned already!";


        var color = "#3c3";
        if (this.fails !== 0)
            color = "#c33";
        document.write("<div style='color:"+color+";'> " + this.name + " [ " + (this.fails === 0?"PASSED":"FAILED")+ " ] </div>");
    }

    this.assert = function(condition)
    {
        if (condition == false)
            this.fail("assertion failed: " + condition);
    }

    this.assertEquals = function(first, second)
    {
        if (first != second)
            this.fail("comparison failed: '" + first + "' != '" + second + "'");
    }

    this.assertIsInstance = function(obj, classRef)
    {
        if (!(obj instanceof classRef))
            this.fail("class assertion failed: <object>(" + obj.constructor.name + ") is not an instance of " + classRef.name);
    }

    this.fail = function(message)
    {
        console.log(this.name + " | " + message);
        document.write("<div style='color:#c33'>  " + this.name + " | " + message + "</div>");
        ++this.fails;
    }

    this.expectThrow = function()
    {
        this.isExceptionExpected = true;
    }
}

function TestSuite(name)
{
    this.name = name;
    this.testCases = Array();

    this.add = function(testCase)
    {
        this.testCases.push(testCase);
    }

    this.run = function()
    {

        console.log("running test suite: " + this.name);
        var failed = false;
        var runnedCases = 0;
        for (var i = 0; i < this.testCases.length; ++i)
        {
            var testCase = this.testCases[i];
            testCase.run();
            ++runnedCases;
            if (!testCase.getResult())
            {
                failed = true;
            }
            testCase.summarize();
        }

        var color = "#c33";
        if (failed === false)
            color = "#3c3";

        document.write("<br /><div style='color:"+color+";'> ### test suite result: " + this.name + " (" + runnedCases + " test case runned) ---- [ " + (failed === false?"PASSED":"FAILED")+" ] </div>");
    }
}
