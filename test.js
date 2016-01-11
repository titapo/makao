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


        var color = "#383";
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
        if (first instanceof Array)
        {
            if (first.length !== second.length)
                this.fail("array comparison failed: (different length) '"
                        + first + "' != '" + second + "'");

            for (var i = 0; i < first.length; ++i) 
            {
                if (first[i] === second[i])
                    continue;

                console.log("position:" + i + ", '" + first[i] + "' != '" + second[i]+ "'");
                this.fail("array comparison failed: '" + first + "' != '" + second + "'");
                return;
            }
            return;
        }

        if (first != second)
        {
            console.log("types: " + typeof(first) + " ~ " + typeof(second));
            suite.first = first;
            suite.second = second;
            this._findAndLogStringDifference(first, second)
            this.fail("comparison failed: '" + first + "' != '" + second + "'");
        }
    }

    this._findAndLogStringDifference = function(first, second)
    {
        if (typeof(first) !== 'string')
            return;

        for (var i = 0; i < first.length; ++i)
        {
            if (first[i] === second[i])
                continue;

            break;
        }
        console.log("position:" + i + ", '" + first[i] + "' != '" + second[i]+ "'");
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

    this.run = function(casesToRun = [])
    {
        document.write("<br /><div style='color:"+color+";'> ### test suite: " + this.name + " </div>");
        var cases = [];
        if (casesToRun.length > 0)
        {
            cases = [];
            for(var key in this.testCases)
            {
                var caseName = this.testCases[key].name;
                if (casesToRun.indexOf(caseName) === -1)
                    continue;

                cases.push(this.testCases[key]);
            }
        }


        console.log("running test suite: " + this.name);
        if (cases.length === 0)
        {
            console.log("running all test cases");
            cases = this.testCases;
        }
        var failed = false;
        var numOfRunnedCases = 0;
        for (var i = 0; i < cases.length; ++i)
        {
            var testCase = cases[i];
            testCase.run();
            ++numOfRunnedCases;
            if (!testCase.getResult())
            {
                failed = true;
            }
            testCase.summarize();
        }

        var color = "#c33";
        if (failed === false)
            color = "#383";

        document.write("<br /><div style='color:"+color+";'> ### test suite result: " + this.name + " (" + numOfRunnedCases + " test case runned) ---- [ " + (failed === false?"PASSED":"FAILED")+" ] </div><br />");
    }
}
