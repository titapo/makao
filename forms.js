function Layer(id)
{
    console.log("create Layer() id='" + id + "'");
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
    console.log("create Window() title='" + title + "'");
    this.title = title;
    this.content = "";
    this.windowId = "w001";

    this.getOutput = function(layerId)
    {
        return "<div id='" + this.windowId + "'class='window'>"
                + "<p class='title'>" + this.title + "</p>"
                + "<div class='body'>"+ this.content + "</div>"
                + "<div class='foot'>"
                    + "<a class='action error' onclick='hideLayer(\"" + layerId + "\")'>close</a>"
                + "</div>"
            + "</div>";
    }

    this.setContent = function(content)
    {
        this.content = content;
    }
}

function FormField(label, name, value = "")
{
    this.label = label;
    this.name = name;
    this.type = "text";
    this.validator = null;
    this.value = value;

    this._displayLabel = function()
    {
        if (this.label.length > 0)
            return this.label + ": ";

        return "";
    }

    this.display = function()
    {
        return this._displayLabel()
            + "<input type='" + this.type + "' name='" + this.name + "' value='" + this.value + "' />";
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
        return this._displayLabel() + "<br />"
            + "<textarea name='" + this.name + "'>" + this.value + "</textarea>";
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
            out += "<input type='" + this.type + "' name='" + this.name + "' value='" + key + "' /> ";
            out += this.optionMap[key] + "<br />";
        }

        return out;
    }
}
RadioFormField.prototype = Object.create(FormField.prototype);

function Form(title)
{
    this.title = title;
    this.inputs = Array();
    this.displayerLayer = null;

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
        out += "<a class='action ok' onclick='Submit(this);'>submit</a>";
        return "<form>" + out + "</form>";
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
        console.log(fieldname + ", " + formNode.elements[fieldname].value);

    }

    if (gForm.submit())
        hideLayer(gForm.displayerLayer.id);

}
