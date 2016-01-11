var suite = new TestSuite("form");
// form field test
suite.add(new TestCase("basic form field", function(test)
            {
                var field = new FormField("Your name", "username", "John");
                test.assertEquals(field.display(),
                    "Your name: <input type='text' name='username' value='John'   />");
                field.setValue("Red");
            }));

suite.add(new TestCase("form field and validator", function(test)
            {
                var field = new FormField("Your name", "username", "John");
                field.validator = function(input) { return input === "Green"}
                field.setValue("Green");
                test.assertEquals(field.value, "Green");

                test.expectThrow();
                field.setValue("Red");
            }));
suite.run([]);
