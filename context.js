/**
 * this class contains contextual variables and methods
 * TODO 
 */
function Context()
{
    this.entityFactory = new EntityFactory();
    this.currentForm = undefined;
    this.config = {}; // default config

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
}

