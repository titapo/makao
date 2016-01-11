var suite = new TestSuite("file reader");
suite.add(new TestCase("file reader", function(test)
            {
                var fh = new FileHandler("./global/conf.json");
                fh.setCallback(function(msg)
                    {});
                fh.read();
                // FIXME does not test anything
            }));

suite.run([]);
