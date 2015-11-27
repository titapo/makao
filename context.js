/**
 * this class contains contextual variables and methods
 * TODO 
 */
function Context(rootNode)
{
    var logger = new Logger("context");
    this.entityFactory = new EntityFactory();
    this.currentForm = undefined;
    this.config = {}; // default config
    this.view = new View(rootNode, new Path([]));

    this.setCurrentForm = function(form)
    {
        if (!(form instanceof Form))
            throw "setCurrentForm(): not a form!";

        this.currentForm = form;
    }

    this.setConfig = function(config)
    {
        this.config = config;
    }

    /**
     * merges new config into existing, overrides
     */
    this.overrideConfig = function(config)
    {
        for (var attr in config)
        {
            this.config[attr] = config[attr];
        }
    }
}

