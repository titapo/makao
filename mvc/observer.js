/**
 * Base class for observers
 */
class Observer
{
    /**
     * Args:
     *    name (string): name of the instance
     *    model (Model): observed model
     */
    constructor(name, model)
    {
        this.name = name;
        this.model = model;
        this.model.attach(this.name, this);
    }

    /**
     * Callback for observant model.
     */
    update()
    {
        console.log("(" + this.name + ") Generic observer!");
    }
}
