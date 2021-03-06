function Layer(id)
{
    var logger = new Logger("layer");
    logger.info("create, id='" + id + "'");
    this.id = id;
    this.layer = document.getElementById(id);

    if (this.layer === null)
        throw "Element with id: '" + layerId + "' is not exist!";

    this.displayForm = function(form)
    {
        win = new Window(form.title);
        form.displayerLayer = this;
        win.setContent(form.display());
        this.displayWindow(win)
    }

    this.displayWindow = function(win)
    {
        this.setContent(win.getOutput(this.id));
        this.show();
    }

    this.setContent = function(content)
    {
        this.layer.innerHTML = content;
    }

    this.show = function()
    {
        this.layer.style.display = "block";

    }
    this.hide = function()
    {
        this.layer.style.display = "none";
    }
}

function Window(title)
{
    var logger = new Logger("window");
    logger.info("create, title='" + title + "'");
    this.title = title;
    this.content = "";
    this.windowId = "w001";

    this.getOutput = function(layerId)
    {
        return Tag('div',
                Tag('p', this.title, {'class':'title'})
                + Tag('div', this.content, {'class':'body'})
                + Tag('div',
                    Tag('a', 'close', {class:'action error', 'onclick':'hideLayer(\'' + layerId + '\')'}),
                {'class':'foot'}),
                {'id':this.windowId, 'class':'window'});
    }

    this.setContent = function(content)
    {
        this.content = content;
    }
}

function FormField(label, name, value = "")
{
    var logger = new Logger("form-field");
    this.label = label;
    this.name = name;
    this.type = "text";
    this.validator = null;
    this.value = value;
    this.attributes = {};

    this._displayLabel = function()
    {
        if (this.label.length > 0)
            return this.label + ": ";

        return "";
    }

    this.display = function()
    {
        logger.debug("FromField.display() name:" + this.name + ", attributes:" + this.attributes)
        return this._displayLabel()
            + '<input type="' + this.type + '" name="' + this.name + '" value="' + this.value + '" '
            + listTagAttributes(this.attributes)
            + ' />';
    }
    this.setAttribute = function(name, value)
    {
        this.attributes[name] = value;
    }

    this.setValue = function(value)
    {
        if (this.validator !== null)
        {
            if (!this.validator(value))
                throw "Validation error of '" + name +"' field";
        }

        this.value = value;
    }
}

function TextFormField(label, name, value = "")
{
    FormField.call(this, label, name, value);
    this.type = "textarea";

    this.display = function()
    {
        return this._displayLabel() + '<br />'
            + '<textarea name="' + this.name + '" ' 
            + listTagAttributes(this.attributes)
            + '">' + this.value + '</textarea><br />';
    }
}
TextFormField.prototype = Object.create(FormField.prototype);

/**
 * optionMap
 * [identifier] => [label]
 * key/identifier must be unique
 * */
function RadioFormField(label, name, optionMap)
{
    if (!(optionMap instanceof Object))
        throw "RadioFormField() expects Object as optionMap";

    FormField.call(this, label, name, "");
    this.type = "radio";
    this.optionMap = optionMap;

    this.display = function()
    {
        var out = this._displayLabel();
            out += "<br />";
        for (var key in this.optionMap)
        {
            out += '<input type="' + this.type + '" name="' + this.name + '" value="' + key + '" ';
            out += listTagAttributes(this.attributes) + " /> ";
            out += this.optionMap[key] + "<br />";
        }

        return out;
    }
}
RadioFormField.prototype = Object.create(FormField.prototype);

function BooleanFormField(label, name, value = false)
{
    if (typeof(value) !== "boolean")
        throw "BooleanFormField() expects boolean as value";

    FormField.call(this, label, name, value);
    this.type = "checkbox";

    this.display = function()
    {
        return '<input type="' + this.type + '" name="' + this.name+ '" '
            + (this.value === true?'checked':'') + " "
            + listTagAttributes(this.attributes)
            + ' /> ' + this.label + '<br />';
    }
}
BooleanFormField.prototype = Object.create(FormField.prototype);

function Form(title)
{
    this.logger = new Logger("form[" + title + "]")
    this.title = title;
    this.inputs = Array();
    this.displayerLayer = null;
    this.submit = null;

    this.addInput = function(field)
    {
        if (!(field instanceof FormField))
            throw "only FormField could be added to form!";

        this.inputs[field.name] = field;
    }

    this.displayFields = function()
    {
        var out = "";
        for (var key in this.inputs)
        {
            out += this.inputs[key].display();
            out += "<br />";
        }

        return out;
    }
    this.display = function()
    {
        out = this.displayFields();
        if (this.sumbit !== null)
        {
            this.logger.debug(">> -- " + typeof(this.submit));
            out += '<a class="action ok" onclick="Submit(this);">submit</a>';
        }
        return '<form>' + out + '</form>';
    }
}

function hideLayer(layerId)
{
   document.getElementById(layerId).style.display = "none";
   SetCurrentForm(null);
}

var gForm = null;
function SetCurrentForm(form)
{
    gForm = form;
}

function Submit(submitButton)
{
    if (gForm === null)
        throw "Submit called on nonexisting form"

    //var nameOfTheNode = submitButton.parentNode.nodeName;
    // must be: "FORM"

    var formNode = submitButton.parentNode;

    for (var fieldname in gForm.inputs)
    {
        var field = gForm.inputs[fieldname];
        field.value = formNode.elements[fieldname].value;
        console.log(fieldname + ": " + formNode.elements[fieldname].value);
    }

    if (gForm.submit(gForm.inputs))
        hideLayer(gForm.displayerLayer.id);

}
