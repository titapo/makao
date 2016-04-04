/**
 * Generic Controller implementation.
 */
class Controller extends Observer
{
    constructor(name, model, view)
    {
        super(name, model);
        this.view = view;
    }
}
