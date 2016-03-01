/**
 * Generic Controller implementation.
 * TODO remove increase/decrease
 */
function Controller(name, model, view)
{
    this._init(name, model); 
    this.view = view;
}
Controller.prototype = Object.create(Observer.prototype);
Controller.prototype.constructor = Controller;
Controller.prototype.view = null;
