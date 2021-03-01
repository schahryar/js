var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Helper = (function () {
    function Helper() {
    }
    //check of the objects exists
    Helper.exists = function (obj) {
        //is object null or undefined
        if (obj === null || obj === undefined) {
            return false;
        }
        return true;
    };
    //check een array van objecten of ze bestaan
    Helper.existsMultiple = function (obj) {
        //loop door objecten en check ze
        for (var i = 0; i < obj.length; i++) {
            if (Helper.exists(obj[i]) === false) {
                return false;
            }
        }
        return true;
    };
    //check of bepaalde string in een string zit
    Helper.stringContains = function (str, check) {
        if (str.indexOf(check) > -1) {
            return true;
        }
        return false;
    };
    /// <summary>
    /// Converts polar to cartesian coordinates
    /// Returns: X,Y Coordinates
    /// </summary>
    /// <param name="_angle">angle of the vector</param>
    /// <param name="_lenght">length of the vector</param>
    /// <returns>X,Y Coordinates</returns>
    Helper.polarToCaresian = function (angle, length) {
        var radAngle = Phaser.Math.degToRad(angle);
        return new Phaser.Point(length * Math.cos(radAngle), length * Math.sin(radAngle));
    };
    /// <summary>
    /// Converts cartesian to polar vector
    /// Returns: X = angle in degrees. Y = Lenght of the vector
    /// </summary>
    /// <param name="_coordinates">coordinates to convect</param>
    /// <returns>X = angle in degrees. Y = Lenght of the vector</returns>
    Helper.cartesianToPolar = function (vector) {
        var lPolar = new Phaser.Point(Phaser.Math.radToDeg(Math.atan2(vector.y, vector.x)), vector.getMagnitude());
        if (lPolar.x < 0) {
            lPolar.x += 360;
        }
        return lPolar;
    };
    return Helper;
}());
var Dlib;
(function (Dlib) {
    var Dobject = (function () {
        //maak variable aan
        function Dobject(name, position, scale, rotation) {
            this.mDestroying = false;
            this._mEnabled = true;
            this._mComponents = new Array();
            this.mName = name;
            this.mTransform = this.addComponent(new Dlib.Transform(position, scale, rotation));
            this.mDoNotDestroy = false;
        }
        Dobject.prototype.create = function (game) {
            this._mGame = game;
            this.mTransform.mGame = game;
        };
        //update loop voor alle componenten
        Dobject.prototype.update = function () {
            if (this._mEnabled) {
                for (var i = this._mComponents.length - 1; i >= 0; i--) {
                    if (this.mDestroying) {
                        return;
                    }
                    this._mComponents[i].update();
                }
            }
        };
        //voeg een component toe
        Dobject.prototype.addComponent = function (component) {
            if (this.hasComponent(component.mName) === false) {
                component.mGame = this._mGame;
                component.mDobject = this;
                component.create();
                component.mActive = true;
                this._mComponents.push(component);
                return component;
            }
            else {
                console.warn("Cannot add multiple components");
            }
            return null;
        };
        //haal een component weg
        Dobject.prototype.removeComponent = function (component) {
            if (typeof component === "string") {
                for (var i = 0; i < this._mComponents.length; i++) {
                    if (this._mComponents[i].mName === component) {
                        this._mComponents[i].destroy();
                        delete this._mComponents.splice(i, 1)[0];
                    }
                }
            }
            else {
                for (var i = 0; i < this._mComponents.length; i++) {
                    if (this._mComponents[i] instanceof component) {
                        this._mComponents[i].destroy();
                        delete this._mComponents.splice(i, 1)[0];
                    }
                }
            }
            return null;
        };
        //haal een component op
        Dobject.prototype.getComponent = function (component) {
            if (typeof component === "string") {
                for (var i = 0; i < this._mComponents.length; i++) {
                    if (this._mComponents[i].mName === component) {
                        return this._mComponents[i];
                    }
                }
            }
            else {
                for (var i = 0; i < this._mComponents.length; i++) {
                    if (this._mComponents[i] instanceof component) {
                        return this._mComponents[i];
                    }
                }
            }
            return null;
        };
        //check of een component er is
        Dobject.prototype.hasComponent = function (component) {
            if (Helper.exists(this.getComponent(component))) {
                return true;
            }
            else {
                return false;
            }
        };
        //notify alle componenten
        Dobject.prototype.notifyComponents = function (message) {
            if (this._mEnabled === false) {
                return;
            }
            for (var i = 0; i < this._mComponents.length; i++) {
                if (Helper.exists(this._mComponents[i].notify)) {
                    this._mComponents[i].notify(message);
                }
            }
        };
        //destroy dit game object
        //en dispatch destroy signal
        Dobject.prototype.destroy = function () {
            this.mDestroying = true;
            this.mEnabled = false;
            //loop door alle components en dispose deze
            if (Helper.exists(this._mComponents)) {
                for (var i = 0; i < this._mComponents.length; i++) {
                    this._mComponents[i].destroy();
                }
                this._mComponents = null;
            }
            this._mGame = null;
            this.mName = null;
            this.mTransform = null;
        };
        Object.defineProperty(Dobject.prototype, "mEnabled", {
            get: function () {
                return this._mEnabled;
            },
            set: function (value) {
                if (this._mEnabled === value) {
                    //als we al aan of uit zijn dan return
                    return;
                }
                this._mEnabled = value;
                //loop door alle components heen
                for (var i = 0; i < this._mComponents.length; i++) {
                    //en enable of disable ze
                    if (this._mEnabled) {
                        this._mComponents[i].enable();
                    }
                    else {
                        this._mComponents[i].disable();
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        return Dobject;
    }());
    Dlib.Dobject = Dobject;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Dcomponent = (function () {
        //maak component aan en zet niet active
        //gameobject maakt dan een refference naar game en naar gameobject
        function Dcomponent(name) {
            this.mName = name;
            this.mActive = false;
        }
        //create komt altijd naa de  constructor
        Dcomponent.prototype.create = function () {
        };
        //verwijder component
        Dcomponent.prototype.destroy = function () {
            this.mName = null;
            this.mGame = null;
            this.mDobject = null;
            this.mActive = null;
        };
        //disable component
        Dcomponent.prototype.disable = function () {
            this.mActive = false;
        };
        //enable component
        Dcomponent.prototype.enable = function () {
            this.mActive = true;
        };
        //update component
        Dcomponent.prototype.update = function () {
        };
        Dcomponent.prototype.notify = function (message) {
            if (!Helper.exists(message)) {
                return;
            }
        };
        return Dcomponent;
    }());
    Dlib.Dcomponent = Dcomponent;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Dcore = (function () {
        function Dcore(game) {
            //check of core instance al bestaat
            if (Helper.exists(Dcore.mInstance)) {
                throw new Error("Error double instance of Dcore!");
            }
            //maak dobject array aan
            this._mDobjects = new Array();
            this._mGame = game;
            //set refference van instance
            Dcore.mInstance = this;
        }
        //loop door alle objecten en loop ze
        Dcore.prototype.updateDobjects = function () {
            //loop door alle objecten heen
            for (var i = this._mDobjects.length - 1; i >= 0; i--) {
                //check of het object wel bestaat
                if (Helper.exists(this._mDobjects[i])) {
                    this._mDobjects[i].update();
                }
                else {
                    //error object bestaat niet!
                    throw Error("Error updating object! Core.updateDobjects()");
                }
            }
        };
        Dcore.prototype.createDobject = function (dobject) {
            //push het object naar objecten array
            this._mDobjects.push(dobject);
            dobject.create(this._mGame);
            return dobject;
        };
        //maak een Dobject DoNotDestroy
        //kan notsteeds verwijderd worden in removeDobject()
        Dcore.prototype.doNotDestroy = function (dobject) {
            if (Helper.exists(dobject)) {
                dobject.mDoNotDestroy = true;
            }
        };
        //verweider een dobject
        Dcore.prototype.removeDobject = function (dobject, callback, context) {
            //maak callback singal aan
            var lCallback = null;
            //check of we callback en context hebben
            if (Helper.existsMultiple([callback, context])) {
                //maak nieuwe signal aan
                lCallback = new Phaser.Signal();
                lCallback.addOnce(callback, context);
            }
            var lIndex = this._mDobjects.indexOf(dobject);
            //check of we de index hebben opgehaald
            if (lIndex === -1) {
                //zo niet error en return
                console.log("Error remove object not found! Core.removeDobject()");
                throw new Error("Error remove object not found! Core.removeDobject()");
            }
            //destroy object
            this._mDobjects[lIndex].destroy();
            this._mDobjects.splice(lIndex, 1);
            //check of we wel een callback hadden
            if (Helper.exists(lCallback)) {
                //zojah dispose de callback
                lCallback.dispose();
                lCallback = null;
            }
        };
        Dcore.prototype.findObjectByName = function (name) {
            //loop door alle objecten heen
            for (var i = 0; i < this._mDobjects.length; i++) {
                //check of het object een naam heeft
                if (Helper.exists(this._mDobjects[i].mName)) {
                    //check of het de correcte naam is
                    if (this._mDobjects[i].mName === name) {
                        //return object
                        return this._mDobjects[i];
                    }
                }
                else {
                    throw new Error("findObjectByName, name is null or undifined");
                }
            }
            return null;
        };
        //check of Dobject bestaat(zou altijd true moeten zijn)
        Dcore.prototype.objectExists = function (dobject) {
            var lIndex = this._mDobjects.indexOf(dobject);
            //check of we de index hebben opgehaald
            if (lIndex === -1) {
                return false;
            }
            else {
                return true;
            }
        };
        //verwijder alle objecten behalve de donotdestroy
        Dcore.prototype.removeAll = function () {
            for (var i = this._mDobjects.length - 1; i >= 0; i--) {
                if (this._mDobjects[i].mDoNotDestroy === false) {
                    this.removeDobject(this._mDobjects[i]);
                }
            }
        };
        Dcore.prototype.objectCount = function () {
            return this._mDobjects.length;
        };
        return Dcore;
    }());
    Dlib.Dcore = Dcore;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    (function (ROTATION) {
        ROTATION[ROTATION["PORTRAIT"] = 0] = "PORTRAIT";
        ROTATION[ROTATION["LANDSCAPE"] = 1] = "LANDSCAPE";
        ROTATION[ROTATION["BOTH"] = 2] = "BOTH";
        ROTATION[ROTATION["LOCK"] = 3] = "LOCK";
    })(Dlib.ROTATION || (Dlib.ROTATION = {}));
    var ROTATION = Dlib.ROTATION;
    var Dscreen = (function () {
        function Dscreen(game, rotation) {
            //check of er een instance van bestaat
            if (Helper.exists(Dscreen.mInstance)) {
                throw new Error("Error double instance of Dscreen!");
            }
            //set refferences en maak variable aan
            this._mGame = game;
            this._mSize = new Phaser.Point(0, 0);
            this._mScale = new Phaser.Point(0, 0);
            //check of we de huidige orientatie moeten nemen
            if (rotation === ROTATION.LOCK) {
                this._mRotation = this.getOrientation();
            }
            else {
                this._mRotation = rotation;
            }
            this._currentSize = new Phaser.Point(0, 0);
            this._previousSize = new Phaser.Point(0, 0);
            //signal voor als resize is
            this.eResize = new Phaser.Signal();
            //set de game scale
            this._mGame.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
            //hook een eventlistener aan game resize
            this._mGame.scale.setResizeCallback(this.screenUpdated, this);
            //align the de game goed
            this._mGame.scale.pageAlignVertically = true;
            this._mGame.scale.pageAlignHorizontally = true;
            //set dscreen instance
            Dscreen.mInstance = this;
            this._mPreviousRotation = this.mRotation;
            this.screenUpdated();
        }
        Object.defineProperty(Dscreen.prototype, "mSize", {
            get: function () {
                return this._mSize;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Dscreen.prototype, "mScale", {
            get: function () {
                return this._mScale;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Dscreen.prototype, "mRotation", {
            get: function () {
                if (this._mRotation === ROTATION.BOTH) {
                    return this.getOrientation();
                }
                else {
                    return this._mRotation;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Dscreen.prototype, "mPreviousRotation", {
            get: function () {
                return this._mPreviousRotation;
            },
            enumerable: true,
            configurable: true
        });
        Dscreen.prototype.screenUpdated = function () {
            this._currentSize.x = window.innerWidth;
            this._currentSize.y = window.innerHeight;
            //check of het scherm wel veranderd is
            if (Phaser.Point.equals(this._currentSize, this._previousSize)) {
                return;
            }
            else {
                this._previousSize.x = window.innerWidth;
                this._previousSize.y = window.innerHeight;
            }
            //reken nieuw schermgroote uit
            //this.calculateScreen(this._mRotation);
            this.scale();
            //set alle nieuwe sizes en scales
            this._mGame.scale.setGameSize(this._mSize.x, this._mSize.y);
            this._mGame.scale.setUserScale(this._mScale.x, this._mScale.y);
            //refresh scherm
            this._mGame.scale.refresh();
            //dispatch screen resized
            this.eResize.dispatch();
        };
        //todo reken de ratio uit en gebruik die ipv screen size
        Dscreen.prototype.scale = function () {
            if (this._mRotation === ROTATION.BOTH) {
                if (this.getOrientation() === ROTATION.LANDSCAPE) {
                    this.scaleLandscape();
                    this._mPreviousRotation = this._mCurrentRotation;
                    this._mCurrentRotation = ROTATION.LANDSCAPE;
                }
                if (this.getOrientation() === ROTATION.PORTRAIT) {
                    this.scalePortrait();
                    this._mPreviousRotation = this._mCurrentRotation;
                    this._mCurrentRotation = ROTATION.PORTRAIT;
                }
            }
            else {
                if (this._mRotation === ROTATION.LANDSCAPE) {
                    this.scaleLandscape();
                    this._mPreviousRotation = ROTATION.LANDSCAPE;
                }
                if (this._mRotation === ROTATION.PORTRAIT) {
                    this.scalePortrait();
                    this._mPreviousRotation = ROTATION.PORTRAIT;
                }
            }
        };
        Dscreen.prototype.scaleLandscape = function () {
            //haal window width en heigth op
            var innerWidth = window.innerWidth;
            var innerHeigt = window.innerHeight;
            //set maximale resolutie
            var maxResolution = new Phaser.Point(1920, 1080);
            //maak variable aan om de nieuwe width, height, scale opteslaan
            var newWidth = 0, newHeigt = 0;
            var scaleX = 1, scaleY = 1;
            //basis resolutie(waar we van uitgaan)
            var baseResolution = new Phaser.Point(800, 600);
            if (this.getOrientation() === ROTATION.LANDSCAPE) {
                newWidth = baseResolution.y * innerWidth / innerHeigt;
                newWidth = Math.min(newWidth, baseResolution.y * maxResolution.x / maxResolution.y);
                newHeigt = baseResolution.y;
                newWidth = Math.ceil(newWidth);
                newHeigt = Math.ceil(newHeigt);
                scaleX = innerWidth / newWidth;
                scaleY = innerHeigt / newHeigt;
            }
            else {
                newWidth = 800;
                newHeigt = 600;
                scaleX = innerWidth / newWidth;
                scaleY = scaleX;
            }
            //set de local variable
            this._mSize.x = newWidth;
            this._mSize.y = newHeigt;
            this._mScale.x = scaleX;
            this._mScale.y = scaleY;
        };
        Dscreen.prototype.scalePortrait = function () {
            //haal window width en heigth op
            var innerWidth = window.innerWidth;
            var innerHeigt = window.innerHeight;
            //set maximale resolutie
            var maxResolution = new Phaser.Point(1920, 1080);
            //maak variable aan om de nieuwe width, height, scale opteslaan
            var newWidth = 0, newHeigt = 0;
            var scaleX = 1, scaleY = 1;
            //set base width and heigth
            var baseResolution = new Phaser.Point(600, 800);
            //switch max resolution around
            maxResolution = new Phaser.Point(maxResolution.y, maxResolution.x);
            //check what type of rotation we have
            if (this.getOrientation() === ROTATION.LANDSCAPE) {
                //landscape in portrait mode dus teken borders
                newWidth = 600;
                newHeigt = 800;
                scaleY = innerHeigt / newHeigt;
                scaleX = scaleY;
            }
            else {
                //portrait in portrait mode wat we willen dus fullscreen
                newHeigt = (baseResolution.x * innerHeigt / innerWidth);
                newHeigt = Math.min(newHeigt, baseResolution.x / (maxResolution.x / maxResolution.y));
                newWidth = baseResolution.x;
                newWidth = Math.ceil(newWidth);
                newHeigt = Math.ceil(newHeigt);
                scaleX = innerWidth / newWidth;
                scaleY = innerHeigt / newHeigt;
            }
            //set de local variable
            this._mSize.x = newWidth;
            this._mSize.y = newHeigt;
            this._mScale.x = scaleX;
            this._mScale.y = scaleY;
        };
        //return de orientatie van het scherm
        Dscreen.prototype.getOrientation = function () {
            if (window.innerWidth > window.innerHeight) {
                return ROTATION.LANDSCAPE;
            }
            else {
                return ROTATION.PORTRAIT;
            }
        };
        Dscreen.prototype.correctOrientation = function () {
            if (this._mGame.device.desktop) {
                return true;
            }
            if (this.getOrientation() === this.mRotation) {
                return true;
            }
            return false;
        };
        return Dscreen;
    }());
    Dlib.Dscreen = Dscreen;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Dstate = (function (_super) {
        __extends(Dstate, _super);
        function Dstate() {
            _super.apply(this, arguments);
        }
        Dstate.prototype.init = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.prototype.init.call(this, args);
            //resize callback voor als het scherm veranderd
            Dlib.Dscreen.mInstance.eResize.add(this.reSize, this);
            this._mLateActivateGuiSignal = new Phaser.Signal();
            Dlib.Dpause.mInstance.mOnFullPaused.add(this.fullPause, this);
            Dlib.Dpause.mInstance.mOnFullResume.add(this.fullResume, this);
            Dlib.Dpause.mInstance.mOnGamePaused.add(this.gamePause, this);
            Dlib.Dpause.mInstance.mOnGameResume.add(this.gameResume, this);
        };
        Dstate.prototype.shutdown = function () {
            _super.prototype.shutdown.call(this);
            //clear refferences
            Dlib.Dscreen.mInstance.eResize.remove(this.reSize, this);
            Dlib.Dpause.mInstance.mOnFullPaused.remove(this.fullPause, this);
            Dlib.Dpause.mInstance.mOnFullResume.remove(this.fullResume, this);
            Dlib.Dpause.mInstance.mOnGamePaused.remove(this.gamePause, this);
            Dlib.Dpause.mInstance.mOnGameResume.remove(this.gameResume, this);
            this._mDoUpdate = null;
            this._mActiveGui = null;
        };
        Dstate.prototype.create = function () {
            _super.prototype.create.call(this);
            //nu pas mogen we updaten
            this._mDoUpdate = true;
        };
        Dstate.prototype.update = function () {
            _super.prototype.update.call(this);
            //check of we mogen updaten
            if (this._mDoUpdate) {
                Dlib.Dcore.mInstance.updateDobjects();
            }
        };
        //switch van gui element of maak een nieuwe
        Dstate.prototype.activateGui = function (name, callback, context) {
            if (Helper.existsMultiple([callback, context])) {
                this._mLateActivateGuiSignal.addOnce(callback, context);
            }
            //check of we al gui element hadden
            if (Helper.exists(this._mActiveGui)) {
                //tween uit en maak callback
                this._mActiveGui.tweenOut(this.lateActivateGui, this, name);
                return;
            }
            this._mActiveGui = Dlib.Dcore.mInstance.createDobject(new Dlib.GuiView(name, this));
            this._mActiveGui.tweenIn();
            this.fixSpeakerButton();
            this._mLateActivateGuiSignal.dispatch();
        };
        //word gebruikt NA dat de huidge gui is uit getweent
        Dstate.prototype.lateActivateGui = function (name) {
            //this._mActiveGui.clearGui();
            ////verwijder de gui die net uit het scherm is getweent
            //Dcore.mInstance.removeDobject(this._mActiveGui);
            this.clearActiveGui();
            //maak de nieuwe gui aan
            this._mActiveGui = Dlib.Dcore.mInstance.createDobject(new Dlib.GuiView(name, this));
            this._mActiveGui.tweenIn();
            this.fixSpeakerButton();
            this._mLateActivateGuiSignal.dispatch();
        };
        Dstate.prototype.removeActiveGui = function () {
            if (Helper.exists(this._mActiveGui)) {
                //tween uit en maak callback
                this._mActiveGui.tweenOut(this.lateRemoveActiveGui, this);
                return;
            }
        };
        Dstate.prototype.clearActiveGui = function () {
            if (Helper.exists(this._mActiveGui)) {
                this._mActiveGui.clearGui();
                //verwijder de gui die net uit het scherm is getweent
                Dlib.Dcore.mInstance.removeDobject(this._mActiveGui);
                this._mActiveGui = null;
            }
        };
        Dstate.prototype.lateRemoveActiveGui = function () {
            this._mActiveGui.clearGui();
            //verwijder de gui die net uit het scherm is getweent
            Dlib.Dcore.mInstance.removeDobject(this._mActiveGui);
            this._mActiveGui = null;
        };
        //resize alle gui elemenen
        Dstate.prototype.reSize = function () {
            if (Helper.exists(this._mActiveGui)) {
                this._mActiveGui.resize();
                this.fixSpeakerButton();
            }
        };
        //switch naar andere staat en kan alles clearen pas op met alles clearen!
        Dstate.prototype.switchState = function (state, clear) {
            //zorg er voor dat niets meer update
            this._mDoUpdate = false;
            if (clear) {
                Dlib.Dcore.mInstance.removeAll();
            }
            this.game.state.start(state, false, false);
        };
        Dstate.prototype.moreGames = function () {
            //window.open("http://www.gobletgames.com/");
        };
        Dstate.prototype.toggleAudio = function () {
            Dlib.Daudio.mInstance.mMute = !Dlib.Daudio.mInstance.mMute;
            this.fixSpeakerButton();
        };
        Dstate.prototype.togglePause = function () {
            if (Dlib.Dpause.mInstance.mGamePaused) {
                Dlib.Dpause.mInstance.mGamePaused = false;
            }
            else {
                Dlib.Dpause.mInstance.mGamePaused = true;
            }
        };
        Dstate.prototype.fixSpeakerButton = function () {
            var lSpeaker = Dlib.Dcore.mInstance.findObjectByName("SpeakerButton");
            if (Helper.exists(lSpeaker)) {
                if (Dlib.Daudio.mInstance.mMute) {
                    lSpeaker.setButton({ mAnchor: null, mGroup: null, mKey: "SpeakerOffButton", mSheet: null });
                }
                else {
                    lSpeaker.setButton({ mAnchor: null, mGroup: null, mKey: "SpeakerButton", mSheet: null });
                }
            }
        };
        Dstate.prototype.gamePause = function () {
        };
        Dstate.prototype.gameResume = function () {
        };
        Dstate.prototype.fullPause = function () {
        };
        Dstate.prototype.fullResume = function () {
        };
        return Dstate;
    }(Phaser.State));
    Dlib.Dstate = Dstate;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Daudio = (function () {
        function Daudio(game) {
            //check of er al een instance bestaat
            if (Helper.exists(Daudio.mInstance)) {
                throw new Error("Error Daudio already Exists!");
            }
            //assign variable
            this._mGame = game;
            this._mMute = false;
            this._mSounds = new Array();
            this._mMusic = null;
            this._mTags = new Array();
            //set instance
            Daudio.mInstance = this;
        }
        Daudio.prototype.playOnce = function (key) {
            //check of we geluid mogen afspelen
            if (this._mMute) {
                return;
            }
            //haal geluid op
            var lSound = this.getSound(key);
            //check of we geluid hadden gekregen
            if (Helper.exists(lSound)) {
                lSound.loop = false;
                lSound.play();
            }
        };
        Daudio.prototype.playOnceTag = function (tag) {
            //haal de tag op
            var lTag = this.getTag(tag);
            //check of we wel de tag hebben
            if (Helper.exists(lTag)) {
                //speel de audio af
                this.playOnce(lTag);
            }
        };
        Daudio.prototype.playRepeating = function (key) {
            //check of we geluid mogen afspelen
            if (this._mMute) {
                return;
            }
            //haal geluid op
            var lSound = this.getSound(key);
            //check of we geluid hadden gekregen
            if (Helper.exists(lSound)) {
                if (lSound.isPlaying === false) {
                    lSound.loop = true;
                    lSound.play();
                }
            }
        };
        Daudio.prototype.stopRepeating = function (key) {
            //haal geluid op
            var lSound = this.getSound(key);
            //check of we geluid hadden gekregen
            if (Helper.exists(lSound)) {
                if (lSound.isPlaying) {
                    lSound.stop();
                }
            }
        };
        Daudio.prototype.getTag = function (tag) {
            //check of we wel tags hebben
            if (Helper.exists(this._mTags)) {
                //loop door alle tags heen
                for (var i = 0; i < this._mTags.length; i++) {
                    //check of elk object wel een tag en een audioname heeft
                    if (this._mTags[i].hasOwnProperty("Tag") && this._mTags[i].hasOwnProperty("AudioNames")) {
                        //check of er wel iets in de autio names zit
                        if (this._mTags[i].AudioNames.length > 0) {
                            //check of de tag het zelfde is als die is mee gegeven
                            if (this._mTags[i].Tag === tag) {
                                //zojah maak playtag aan die we mee gaan geven aan playonce
                                var lPlayTag;
                                //check of we meerdere tags hebben
                                if (this._mTags[i].AudioNames.length > 1) {
                                    //zojah kies random getal tussen 0 en length-1
                                    lPlayTag = this._mTags[i].AudioNames[this._mGame.rnd
                                        .integerInRange(0, this._mTags[i].AudioNames.length - 1)];
                                }
                                else {
                                    //nee kies eerste geluidje
                                    lPlayTag = this._mTags[i].AudioNames[0];
                                }
                                //speel geluid af
                                return lPlayTag;
                            }
                        }
                    }
                    else {
                        console.log("Error incorrect autio tag!");
                    }
                }
            }
            else {
                console.log("Error no audio tag!");
            }
            return null;
        };
        //haal het geluid op uit mSounds of mMarkers
        //als we het daar niet vinden maken we een nieuwe sound aan
        Daudio.prototype.getSound = function (name) {
            //check of we het bestandje in de sounds array hebben
            for (var i = 0; i < this._mSounds.length; i++) {
                if (this._mSounds[i].key === name) {
                    return this._mSounds[i];
                }
            }
            //check of we de sound wel in cache hebben
            if (this._mGame.cache.checkSoundKey(name)) {
                //maak nieuw sound aan
                var lNewSound = this._mGame.add.sound(name); //set op multiple
                //zorg er voor dat we het geluid meerdere keren kunnen afspelen
                lNewSound.allowMultiple = true;
                //push nieuwe sound toe aan sound array
                this._mSounds.push(lNewSound);
                //return nieuwe sound
                return lNewSound;
            }
            else {
                //Geen sound in cache het bestaat niet ERROR!
                console.log("sound not found!");
            }
            //niets gevonden
            return null;
        };
        //zoek een json bestand uit de cache en laad die in private variable
        Daudio.prototype.loadTags = function (jsonName) {
            var lJson = this._mGame.cache.getJSON(jsonName);
            if (Helper.exists(lJson)) {
                this._mTags = lJson.AudioTags;
            }
            else {
                console.log("Error loading tags!");
            }
        };
        Daudio.prototype.setMusic = function (name, tag) {
            //check of het een tag is
            if (tag) {
                //zojah haal de tag naam op
                name = this.getTag(name);
            }
            //haal muziek op
            var lSound = this.getSound(name);
            //music not found
            if (!Helper.exists(lSound)) {
                console.log(name + " music not found!");
                return;
            }
            //check of we al een muziekje hebben
            if (Helper.exists(this._mMusic)) {
                //check of het niet de zelfde muziek
                if (this._mMusic.key === name) {
                    //music already set
                    return;
                }
                else {
                    //stop eerst audio muziek
                    this.stopMusic();
                    //assign nieuwe muziek
                    this._mMusic = lSound;
                    lSound.loop = false;
                }
            }
            else {
                //geen music
                //assign nieuwe muziek
                this._mMusic = lSound;
                lSound.loop = false;
            }
        };
        Daudio.prototype.pauseMusic = function () {
            if (Helper.exists(this._mMusic)) {
                this._mMusic.pause();
            }
        };
        Daudio.prototype.resumeMusic = function () {
            if (this._mMute) {
                return;
            }
            if (Helper.exists(this._mMusic)) {
                if (this._mMusic.paused) {
                    this._mMusic.resume();
                }
            }
        };
        Daudio.prototype.stopMusic = function () {
            //stop muziek
            if (Helper.exists(this._mMusic)) {
                this._mMusic.stop();
            }
        };
        Daudio.prototype.startMusic = function (looping) {
            if (this._mMute) {
                return;
            }
            if (Dlib.Dpause.mInstance.mFullPause) {
                return;
            }
            if (!Helper.exists(looping)) {
                looping = false;
            }
            //check of muziek er is zo jah speel em af looping of niet
            if (Helper.exists(this._mMusic)) {
                if (this._mMusic.isPlaying === false) {
                    if (looping) {
                        this._mMusic.loop = true;
                        this._mMusic.play();
                    }
                    else {
                        this._mMusic.loop = false;
                        this._mMusic.play();
                    }
                }
            }
        };
        /**
         *  Stops all het geluid
         * @returns {}
         */
        Daudio.prototype.stopAllSound = function () {
            for (var i = 0; i < this._mSounds.length; i++) {
                this._mSounds[i].stop();
            }
        };
        Object.defineProperty(Daudio.prototype, "mMute", {
            //get en set van mute
            get: function () {
                return this._mMute;
            },
            set: function (value) {
                this._mMute = value;
                if (value) {
                    this.stopMusic();
                }
                else {
                    this.startMusic(true);
                }
            },
            enumerable: true,
            configurable: true
        });
        return Daudio;
    }());
    Dlib.Daudio = Daudio;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Dlayer = (function () {
        function Dlayer(game) {
            //check of core instance al bestaat
            if (Helper.exists(Dlayer.mInstance)) {
                throw new Error("Error double instance of Dlayer!");
            }
            this._mGame = game;
            this._mLayer = new Array();
            this.makeLayer("BASE", 99);
            //set refference van instance
            Dlayer.mInstance = this;
        }
        //haal een specifieke layer op
        Dlayer.prototype.getLayer = function (name) {
            //loop door de layers heen en check of de naam overeen komt
            for (var i = 0; i < this._mLayer.length; i++) {
                if (this._mLayer[i][0] === name) {
                    //return de layer
                    return this._mLayer[i][1];
                }
            }
            return null;
        };
        //haal de basis layer op(zou altijd het laagst moeten zijn)
        Dlayer.prototype.getBaseLayer = function () {
            return this.getLayer("BASE");
        };
        Dlayer.prototype.makeLayer = function (name, index) {
            //check of de layer al bestaat
            if (Helper.exists(this.getLayer(name))) {
                return null;
            }
            //check of deze layer nummer al bezet is
            if (this.checkIFindexExists(index)) {
                return null;
            }
            //maak nieuwe group aan
            var lLayer = this._mGame.add.group();
            //push de nieuwe group naar layer array met de index dat de group moet zijn
            this._mLayer.push([name, lLayer, index]);
            //sorteer de layers
            this.sortLayers();
            //return de layer
            return this._mLayer[this._mLayer.length - 1][1];
        };
        //verander de index van een layer
        Dlayer.prototype.changeIndex = function (name, index) {
            //check of deze layer nummer al bezet is
            if (this.checkIFindexExists(index)) {
                return null;
            }
            //loop door alle layers en fix de index
            for (var i = 0; i < this._mLayer.length; i++) {
                if (this._mLayer[i][0] === name) {
                    this._mLayer[i][2] = index;
                }
            }
            this.sortLayers();
        };
        Dlayer.prototype.checkIFindexExists = function (index) {
            //loop door alle layers en check of ze het index nummer hebben
            for (var i = 0; i < this._mLayer.length; i++) {
                if (this._mLayer[i][2] === index) {
                    return true;
                }
            }
            return false;
        };
        //verwijder een layer
        Dlayer.prototype.removeLayer = function (name) {
            for (var i = 0; i < this._mLayer.length; i++) {
                if (this._mLayer[i][0] === name) {
                    this._mLayer.splice(i, 1)[1].removeAll();
                }
            }
            this.sortLayers();
        };
        //Sorteerd van laag naar hoog
        //1,2,3,4,6,8
        //het laagste nummer zal de layer zijn die boven op is
        Dlayer.prototype.sortLayers = function () {
            this._mLayer.sort(this.sortingAlgorithm);
            for (var i = 0; i < this._mLayer.length; i++) {
                this._mGame.world.bringToTop(this._mLayer[(this._mLayer.length - 1) - i][1]);
            }
        };
        Dlayer.prototype.sortingAlgorithm = function (a, b) {
            if (a[2] === b[2]) {
                return 0;
            }
            else {
                return (a[2] < b[2]) ? -1 : 1;
            }
        };
        return Dlayer;
    }());
    Dlib.Dlayer = Dlayer;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Transform = (function (_super) {
        __extends(Transform, _super);
        function Transform(position, scale, rotation) {
            _super.call(this, "Transform");
            this._mPosition = position || new Phaser.Point(0, 0);
            this._mScale = scale || new Phaser.Point(0, 0);
            this._mRotation = rotation || 0;
            //check of position hebben
            //if (Helper.exists(position)) {
            //    this._mPosition = position;
            //} else {
            //    this._mPosition = new Phaser.Point(0, 0);
            //}
            ////check of we scale hebben
            //if (Helper.exists(scale)) {
            //    this._mScale = scale;
            //} else {
            //    this._mScale = new Phaser.Point(1, 1);
            //}
            ////check of we rotation hebben
            //if (Helper.exists(rotation)) {
            //    this._mRotation = rotation;
            //} else {
            //    this._mRotation = 0;
            //}
        }
        Transform.prototype.create = function () {
            _super.prototype.create.call(this);
        };
        Transform.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mPosition = null;
            this._mScale = null;
            this._mRotation = null;
            this._mRenderObject = null;
        };
        //todo fast set position moet default worden zonder notify te gebruiken
        //als we een direct refference hebben naar render object dan verplaats
        Transform.prototype.fastSetPosition = function (x, y, point) {
            if (Helper.exists(point)) {
                x = point.x;
                y = point.y;
            }
            if (Helper.exists(this._mRenderObject)) {
                this._mRenderObject.x = x;
                this._mRenderObject.y = y;
            }
            else {
                console.warn("Transform.TS: No object in fast position");
                this.mPosition = new Phaser.Point(x, y);
            }
        };
        //als we directe refference hebben naar render object dan scale
        Transform.prototype.fastSetScale = function (x, y, point) {
            if (Helper.exists(point)) {
                x = point.x;
                y = point.y;
            }
            if (Helper.exists(this._mRenderObject)) {
                this._mRenderObject.scale.x = x;
                this._mRenderObject.scale.y = y;
            }
            else {
                console.warn("Transform.TS: No object in fast scale");
                this.mScale = new Phaser.Point(x, y);
            }
        };
        Transform.prototype.fastSetRotation = function (r) {
            if (Helper.exists(this._mRenderObject)) {
                this._mRenderObject.rotation = Phaser.Math.degToRad(r);
            }
            else {
                console.warn("Transform.TS: No object in fast scale");
                this.mRotation = r;
            }
        };
        Object.defineProperty(Transform.prototype, "mPosition", {
            //get set position
            get: function () {
                return this._mPosition;
            },
            set: function (position) {
                this._mPosition.x = position.x;
                this._mPosition.y = position.y;
                this.mDobject.notifyComponents("PositionChanged");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "mScale", {
            //get set scale
            get: function () {
                return this._mScale;
            },
            set: function (scale) {
                this._mScale.x = scale.x;
                this._mScale.y = scale.y;
                this.mDobject.notifyComponents("ScaleChanged");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "mRotation", {
            //get set rotation
            get: function () {
                return Phaser.Math.radToDeg(this._mRotation);
            },
            set: function (rotation) {
                this._mRotation = Phaser.Math.degToRad(rotation);
                this.mDobject.notifyComponents("RotationChanged");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "mRenderObject", {
            get: function () {
                return this._mRenderObject;
            },
            set: function (obj) {
                this._mRenderObject = obj;
            },
            enumerable: true,
            configurable: true
        });
        return Transform;
    }(Dlib.Dcomponent));
    Dlib.Transform = Transform;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var GuiTransform = (function (_super) {
        __extends(GuiTransform, _super);
        function GuiTransform(value) {
            _super.call(this, "GuiTransform");
            //portrait
            this._mPortraitAnchor1 = value.mPortraitAnchor1;
            this._mPortraitAnchor2 = value.mPortraitAnchor2;
            //landscape
            this._mLandscapeAnchor1 = value.mLandscapeAnchor1;
            this._mLandscapeAnchor2 = value.mLandscapeAnchor2;
            //alignment
            this._mAlignment = value.mAlignment;
            //layer
            this._mLayer = value.mLayer;
            //check elke orientation we hebben en maak de active anchors aan
            if (value.mOrientation === Dlib.ROTATION.PORTRAIT) {
                this._mActiveAnchor1 = this._mPortraitAnchor1;
                this._mActiveAnchor2 = this._mPortraitAnchor2;
            }
            else {
                this._mActiveAnchor1 = this._mLandscapeAnchor1;
                this._mActiveAnchor2 = this._mLandscapeAnchor2;
            }
            //assign other variables
            this._mSize = new Phaser.Point(0, 0);
            this._mPosition = new Phaser.Point(0, 0);
            this._mDebug = value.mDebug;
        }
        GuiTransform.prototype.create = function () {
            _super.prototype.create.call(this);
            this.resize();
        };
        GuiTransform.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            //portrait
            this._mPortraitAnchor1 = null;
            this._mPortraitAnchor2 = null;
            //landscape
            this._mLandscapeAnchor1 = null;
            this._mLandscapeAnchor2 = null;
            //active
            this._mActiveAnchor1 = null;
            this._mActiveAnchor2 = null;
            //alignment
            this._mAlignment = null;
            //size
            this._mSize = null;
            this._mPosition = null;
            //line
            if (Helper.exists(this._mLine)) {
                this._mLine.destroy();
            }
            this._mLine = null;
            this._mDebug = null;
        };
        GuiTransform.prototype.toTop = function () {
            this.mDobject.notifyComponents("ToTop");
        };
        GuiTransform.prototype.portrait = function () {
            this._mActiveAnchor1 = this._mPortraitAnchor1;
            this._mActiveAnchor2 = this._mPortraitAnchor2;
            this.resize();
        };
        GuiTransform.prototype.landscape = function () {
            this._mActiveAnchor1 = this._mLandscapeAnchor1;
            this._mActiveAnchor2 = this._mLandscapeAnchor2;
            this.resize();
        };
        GuiTransform.prototype.resize = function () {
            //reken nieuwe size uit van gui element
            this._mSize.x = this.percentToPosition(this._mActiveAnchor2).x - this.percentToPosition(this._mActiveAnchor1).x;
            this._mSize.y = this.percentToPosition(this._mActiveAnchor2).y - this.percentToPosition(this._mActiveAnchor1).y;
            //reken nieuwe positie uit met alignment
            this._mPosition = this.calculatePosition(this._mAlignment);
            //check of we debug draw moeten doen
            if (this._mDebug) {
                this.drawDebug();
            }
        };
        //reken een procent positie om naar coordinaten positie
        GuiTransform.prototype.percentToPosition = function (percent) {
            return new Phaser.Point(this.mGame.width * percent.x, this.mGame.height * percent.y);
        };
        //reken het het alignment punt uit
        //linksboven anchor + width * alignment x achor(0.5 voor de helft)
        //linksboven anchor + heigt * alignment y achor(0.5 voor de helft)
        GuiTransform.prototype.calculatePosition = function (alignment) {
            var lPoint = this.percentToPosition(this._mActiveAnchor1);
            return new Phaser.Point(lPoint.x + (this._mSize.x * alignment.x), lPoint.y + (this._mSize.y * alignment.y));
        };
        //bereken de scale aan de hand van de size(van een object)
        GuiTransform.prototype.calculateScaleFromSize = function (size) {
            //bereken beide scale, zo haal daarna de laagste er uit dat is onze nieuwe scale
            var scaleX = this._mSize.x / size.x;
            var scaleY = this._mSize.y / size.y;
            var smallestScale = Math.min(scaleX, scaleY);
            return new Phaser.Point(smallestScale, smallestScale);
        };
        //rekend de positie uit van out of screen positie
        GuiTransform.prototype.calculateOutofScreenPosition = function (size) {
            /////Check of we dichter bij de x of y border zitten
            var xafstand;
            if (this.mPosition.x > this.mGame.width / 2) {
                xafstand = this.mGame.width - this.mPosition.x;
            }
            else {
                xafstand = this.mPosition.x;
            }
            var yafstand;
            if (this.mPosition.y > this.mGame.width / 2) {
                yafstand = this.mGame.height - this.mPosition.y;
            }
            else {
                yafstand = this.mPosition.y;
            }
            /////////als we dichter bij de X zitten dan aan de X kant uit het scherm anders voor de Y as doen
            var x = this.mPosition.x;
            var y = this.mPosition.y;
            if (xafstand < yafstand) {
                if (this.mPosition.x > this.mGame.width / 2) {
                    x = this.mGame.width + size.x;
                }
                else {
                    x = 0 - size.x;
                }
            }
            else {
                if (this.mPosition.y > this.mGame.height / 2) {
                    y = this.mGame.height + size.y;
                }
                else {
                    y = 0 - size.y;
                }
            }
            //return out of screen position
            return new Phaser.Point(x, y);
        };
        //maak een line renderer aan en teken 4 lijnen tussen alle 4 de hoek punten, op elke hoek teken een circle
        GuiTransform.prototype.drawDebug = function () {
            if (Helper.exists(this._mLine) === false) {
                this._mLine = this.mGame.add.graphics(0, 0);
            }
            var p1 = this.percentToPosition(this._mActiveAnchor1);
            var p2 = this.percentToPosition(new Phaser.Point(this._mActiveAnchor2.x, this._mActiveAnchor1.y));
            var p3 = this.percentToPosition(this._mActiveAnchor2);
            var p4 = this.percentToPosition(new Phaser.Point(this._mActiveAnchor1.x, this._mActiveAnchor2.y));
            this._mLine.moveTo(0, 0);
            this._mLine.clear();
            this._mLine.lineStyle(1, 0xffffff, 1);
            this._mLine.drawCircle(p1.x, p1.y, 10);
            this._mLine.drawCircle(p2.x, p2.y, 10);
            this._mLine.drawCircle(p3.x, p3.y, 10);
            this._mLine.drawCircle(p4.x, p4.y, 10);
            this._mLine.moveTo(p1.x, p1.y);
            this._mLine.lineTo(p2.x, p2.y);
            this._mLine.lineTo(p3.x, p3.y);
            this._mLine.lineTo(p4.x, p4.y);
            this._mLine.lineTo(p1.x, p1.y);
        };
        Object.defineProperty(GuiTransform.prototype, "mSize", {
            get: function () {
                return this._mSize;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GuiTransform.prototype, "mPosition", {
            get: function () {
                return this._mPosition;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GuiTransform.prototype, "mAlignment", {
            get: function () {
                return this._mAlignment;
            },
            set: function (value) {
                this._mAlignment = value;
                this.resize();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GuiTransform.prototype, "mLayer", {
            get: function () {
                return this._mLayer;
            },
            enumerable: true,
            configurable: true
        });
        return GuiTransform;
    }(Dlib.Dcomponent));
    Dlib.GuiTransform = GuiTransform;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    //todo kijk of er niet een render component gemaakt kan worden die alle core functionalitijd heeft van een image
    var Image = (function (_super) {
        __extends(Image, _super);
        function Image(iImage) {
            _super.call(this, "Image");
            this._mKey = iImage.mKey;
            this._mSheet = iImage.mSheet;
            this._mAnchor = iImage.mAnchor;
            this._mGroup = iImage.mGroup;
        }
        Image.prototype.create = function () {
            _super.prototype.create.call(this);
            this._mTransform = this.mDobject.mTransform;
            //maak image
            this.setImage(this._mKey, this._mSheet, this._mAnchor, this._mGroup);
            //set refference in transform naar deze image
            this._mTransform.mRenderObject = this._mImage;
        };
        Image.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            //haal image uit de group/layer
            if (Helper.exists(this._mGroup)) {
                this._mGroup.remove(this._mImage);
                this._mGroup = null;
            }
            //destroy de image
            this._mImage.destroy();
            this._mImage = null;
            this._mTransform = null;
            this._mKey = null;
            this._mAnchor = null;
            this._mSheet = null;
        };
        Image.prototype.disable = function () {
            _super.prototype.disable.call(this);
            this._mImage.kill();
        };
        Image.prototype.enable = function () {
            _super.prototype.enable.call(this);
            this._mImage.revive();
        };
        Image.prototype.setImage = function (key, sheet, anchor, group) {
            if (Helper.exists(key)) {
                this._mKey = key;
            }
            if (Helper.exists(sheet)) {
                this._mSheet = sheet;
            }
            //check of we een nieuwe anchor hebben
            if (Helper.exists(anchor)) {
                this._mAnchor = anchor;
            }
            else {
                //check of we al een private anchor hadden
                if (!Helper.exists(this._mAnchor)) {
                    //maak nieuw achor point aan
                    this._mAnchor = new Phaser.Point(0.5, 0.5);
                }
            }
            //check of we een nieuwe groep hebben
            if (Helper.exists(group)) {
                //check of we al een groep hadden
                if (Helper.exists(this._mGroup) && Helper.exists(this._mImage)) {
                    this._mGroup.remove(this._mImage);
                }
                this._mGroup = group;
            }
            else {
                if (!Helper.exists(this._mGroup)) {
                    this._mGroup = Dlib.Dlayer.mInstance.getBaseLayer();
                }
            }
            //check of de image al bestaat
            if (Helper.exists(this._mImage) === false) {
                //haal transform positie op
                var lTempPosition = this._mTransform.mPosition;
                //check of er een sheet is en maak image aan
                if (Helper.exists(this._mSheet)) {
                    this._mImage = this.mGame.add.image(lTempPosition.x, lTempPosition.y, this._mSheet, this._mKey);
                }
                else {
                    this._mImage = this.mGame.add.image(lTempPosition.x, lTempPosition.y, this._mKey);
                }
            }
            else {
                //check of er een sheet is
                //load de frame/key
                if (Helper.exists(this._mSheet)) {
                    this._mImage.loadTexture(this._mSheet);
                    this._mImage.frameName = this._mKey;
                }
                else {
                    this._mImage.loadTexture(this._mKey);
                }
            }
            //anchor de sprite
            this._mImage.anchor = this._mAnchor;
            //bug: als je de 2e keer set image aanroept dan gaat het fout met de group van de image
            //voeg de image toe aan de group
            if (Helper.exists(this._mGroup)) {
                this._mGroup.add(this._mImage);
            }
        };
        Image.prototype.scaleToPixel = function (size) {
            var x = size.x / this._mImage.width;
            var y = size.y / this._mImage.height;
            this.mDobject.mTransform.mScale = new Phaser.Point(x, y);
        };
        Object.defineProperty(Image.prototype, "mPosition", {
            set: function (position) {
                if (Helper.exists(this.mImage)) {
                    this._mImage.position = position;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "mScale", {
            set: function (scale) {
                if (Helper.exists(this.mImage)) {
                    this._mImage.scale = scale;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "mRotation", {
            set: function (rotation) {
                if (Helper.exists(this.mImage)) {
                    this._mImage.rotation = rotation;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "mImage", {
            get: function () {
                return this._mImage;
            },
            enumerable: true,
            configurable: true
        });
        Image.prototype.notify = function (message) {
            _super.prototype.notify.call(this, message);
            switch (message) {
                case "PositionChanged":
                    this.mPosition = this._mTransform.mPosition;
                    break;
                case "ScaleChanged":
                    this.mScale = this._mTransform.mScale;
                    break;
                case "RotationChanged":
                    this.mRotation = Phaser.Math.degToRad(this._mTransform.mRotation);
                    break;
                case "ToTop":
                    this._mImage.bringToTop();
                    break;
            }
        };
        return Image;
    }(Dlib.Dcomponent));
    Dlib.Image = Image;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite(iImage) {
            _super.call(this, "Sprite");
            this._mKey = iImage.mKey;
            this._mSheet = iImage.mSheet;
            this._mAnchor = iImage.mAnchor;
            this._mGroup = iImage.mGroup;
            this._mFps = 60;
        }
        Sprite.prototype.create = function () {
            _super.prototype.create.call(this);
            this._mTransform = this.mDobject.mTransform;
            this.setSprite(this._mKey, this._mSheet, this._mAnchor, this._mGroup);
            //refference in transform
            this._mTransform.mRenderObject = this._mSprite;
        };
        Sprite.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            //haal image uit de group/layer
            if (Helper.exists(this._mGroup)) {
                this._mGroup.remove(this._mSprite);
                this._mGroup = null;
            }
            //destroy de image
            this._mSprite.destroy();
            this._mSprite = null;
            this._mTransform = null;
            this._mKey = null;
            this._mAnchor = null;
            this._mSheet = null;
            this._mFps = null;
        };
        Sprite.prototype.disable = function () {
            _super.prototype.disable.call(this);
            this._mSprite.kill();
        };
        Sprite.prototype.enable = function () {
            _super.prototype.enable.call(this);
            this._mSprite.revive();
        };
        Sprite.prototype.setSprite = function (key, sheet, anchor, group) {
            if (Helper.exists(key)) {
                this._mKey = key;
            }
            if (Helper.exists(sheet)) {
                this._mSheet = sheet;
            }
            //check of we een nieuwe anchor hebben
            if (Helper.exists(anchor)) {
                this._mAnchor = anchor;
            }
            else {
                //check of we al een private anchor hadden
                if (!Helper.exists(this._mAnchor)) {
                    //maak nieuw achor point aan
                    this._mAnchor = new Phaser.Point(0.5, 0.5);
                }
            }
            //check of we een nieuwe groep hebben
            if (Helper.exists(group)) {
                //check of we al een groep hadden
                if (Helper.exists(this._mGroup) && Helper.exists(this._mSprite)) {
                    this._mGroup.remove(this._mSprite);
                }
                this._mGroup = group;
            }
            else {
                if (!Helper.exists(this._mGroup)) {
                    this._mGroup = Dlib.Dlayer.mInstance.getBaseLayer();
                }
            }
            //check of de image al bestaat
            if (Helper.exists(this._mSprite) === false) {
                //haal transform positie op
                var lTempPosition = this._mTransform.mPosition;
                //check of er een sheet is en maak image aan
                if (Helper.exists(this._mSheet)) {
                    this._mSprite = this.mGame.add.sprite(lTempPosition.x, lTempPosition.y, this._mSheet, this._mKey);
                }
                else {
                    this._mSprite = this.mGame.add.sprite(lTempPosition.x, lTempPosition.y, this._mKey);
                }
            }
            else {
                //check of er een sheet is
                //load de frame/key
                if (Helper.exists(this._mSheet)) {
                    this._mSprite.loadTexture(this._mSheet);
                    this._mSprite.frameName = this._mKey;
                }
                else {
                    this._mSprite.loadTexture(this._mKey);
                }
            }
            //anchor de sprite
            this._mSprite.anchor = this._mAnchor;
            //bug: als je de 2e keer set image aanroept dan gaat het fout met de group van de image
            //voeg de image toe aan de group
            if (Helper.exists(this._mGroup)) {
                this._mGroup.add(this._mSprite);
            }
        };
        Object.defineProperty(Sprite.prototype, "mPosition", {
            set: function (position) {
                if (Helper.exists(this._mSprite)) {
                    this._mSprite.position = position;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "mScale", {
            set: function (scale) {
                if (Helper.exists(this._mSprite)) {
                    this._mSprite.scale = scale;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "mRotation", {
            set: function (rotation) {
                if (Helper.exists(this._mSprite)) {
                    this._mSprite.rotation = rotation;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "mSprite", {
            get: function () {
                return this._mSprite;
            },
            enumerable: true,
            configurable: true
        });
        Sprite.prototype.notify = function (message) {
            _super.prototype.notify.call(this, message);
            switch (message) {
                case "PositionChanged":
                    this.mPosition = this._mTransform.mPosition;
                    break;
                case "ScaleChanged":
                    this.mScale = this._mTransform.mScale;
                    break;
                case "RotationChanged":
                    this.mRotation = Phaser.Math.degToRad(this._mTransform.mRotation);
                    break;
                case "ToTop":
                    this._mSprite.bringToTop();
                    break;
            }
        };
        //todo fix dat min frame altijd 0 is
        //je telt bij generateframes van 0 tot x
        //de nummering plakt die achter de prefixFrame
        Sprite.prototype.addAnimation = function (animationInterface) {
            if (!Helper.exists(this._mSprite)) {
                console.log("SpriteComponent: addAnimation no sprite");
                return;
            }
            if (animationInterface.mAllFrames) {
                //maak animation met frames
                this._mSprite.animations.add("Animation");
            }
            else {
                //maak animation met frames
                this._mSprite.animations.add("Animation", Phaser.Animation.generateFrameNames(animationInterface.mPrefix, animationInterface.mStart, animationInterface.mStop, animationInterface.mSuffix, animationInterface.mZeroPad));
            }
            if (Helper.exists(animationInterface.mFps)) {
                this._mFps = animationInterface.mFps;
            }
            //check of er een callback is
            if (Helper.exists(animationInterface.mCallback) && Helper.exists(animationInterface.mContext)) {
                this._mSprite.animations.getAnimation("Animation").onComplete.add(animationInterface.mCallback, animationInterface.mContext);
            }
        };
        Object.defineProperty(Sprite.prototype, "mAnimation", {
            get: function () {
                var lAnimation = this._mSprite.animations.getAnimation("Animation");
                if (Helper.exists(lAnimation)) {
                    return lAnimation;
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Sprite.prototype.playAnimation = function (loop, fps) {
            if (!Helper.exists(this._mSprite)) {
                console.log("SpriteComponent: playAnimation no sprite");
                return;
            }
            if (!Helper.exists(fps)) {
                this._mFps = fps;
            }
            this._mSprite.animations.play("Animation", this._mFps, loop);
        };
        Sprite.prototype.stopAnimation = function () {
            if (!Helper.exists(this._mSprite)) {
                console.log("SpriteComponent: stopAnimation no sprite");
                return;
            }
            this._mSprite.animations.stop();
        };
        Sprite.prototype.resetAnimation = function () {
            this._mSprite.animations.frame = 0;
        };
        return Sprite;
    }(Dlib.Dcomponent));
    Dlib.Sprite = Sprite;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Timer = (function (_super) {
        __extends(Timer, _super);
        function Timer() {
            _super.call(this, "Timer");
            this._mPaused = true;
            this.mStarted = false;
            this._mEvents = new Array();
            this._mRepeating = new Array();
            this._mTime = 0;
            this.mElapsed = 0;
        }
        Timer.prototype.create = function () {
            _super.prototype.create.call(this);
        };
        //todo refactor repeating timer! nu reset hij de tijd elke keer wat niet mag!
        Timer.prototype.update = function () {
            //check of het niet paused is
            if (this.mPaused === false && this.mStarted) {
                //tel tijd op
                this._mTime += this.mGame.time.elapsedMS;
                //check of we wel repeating event hebben
                if (this._mRepeating.length > 0) {
                    if (this._mRepeating[0] <= this._mTime) {
                        this._mRepeating[1].dispatch();
                        this._mTime = 0;
                    }
                }
                //loop door de events in reverse
                for (var i = this._mEvents.length - 1; i >= 0; i--) {
                    //check of de tijd die voorbij is
                    if (this._mEvents[i][0] <= this._mTime) {
                        //var lSignal: any = this._mEvents[i][1];
                        //dispatch event
                        this._mEvents[i][1].dispatch();
                    }
                }
                this.mElapsed = this._mTime;
            }
        };
        Timer.prototype.start = function () {
            //unpause de timer
            this.mPaused = false;
            this.mStarted = true;
        };
        Timer.prototype.stop = function () {
            this.mStarted = false;
        };
        Timer.prototype.reset = function () {
            this.mStarted = false;
            this.mPaused = true;
            this._mTime = 0;
            this.mElapsed = 0;
            this.clearEvents();
        };
        Timer.prototype.clearEvents = function () {
            while (this._mEvents.length > 0) {
                this._mEvents[0][1].dispose();
                this._mEvents.splice(0, 1);
            }
            if (this._mRepeating.length > 0) {
                this._mRepeating[1].dispose();
                this._mRepeating.pop();
                this._mRepeating.pop();
            }
        };
        Timer.prototype.addEvent = function (time, callback, context, arg) {
            if (this.mActive === false) {
                return;
            }
            //maak nieuwe signal aan en stop hem in de event array
            this._mEvents.push([time, new Phaser.Signal()]);
            this._mEvents[this._mEvents.length - 1][1].addOnce(callback, context, 0, arg);
        };
        Timer.prototype.addRepeatingEvent = function (time, callback, context) {
            if (this._mRepeating.length > 0) {
                this._mRepeating[1].dispose();
                this._mRepeating.pop();
                this._mRepeating.pop();
            }
            this._mRepeating.push(time);
            this._mRepeating.push(new Phaser.Signal());
            this._mRepeating[1].add(callback, context);
        };
        Object.defineProperty(Timer.prototype, "mPaused", {
            get: function () {
                return this._mPaused;
            },
            set: function (value) {
                this._mPaused = value;
                return;
            },
            enumerable: true,
            configurable: true
        });
        Timer.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.clearEvents();
            this._mTime = null;
            this._mPaused = null;
            this._mEvents = null;
            this.mElapsed = null;
            this.mStarted = null;
        };
        return Timer;
    }(Dlib.Dcomponent));
    Dlib.Timer = Timer;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Tween = (function (_super) {
        __extends(Tween, _super);
        function Tween(time) {
            _super.call(this, "Tween");
            this._mTime = time || 10000;
            //if (Helper.exists(time)) {
            //    this._mTime = time;
            //} else {
            //    this._mTime = 10000;
            //}
        }
        Tween.prototype.create = function () {
            this._mTransform = this.mDobject.mTransform;
        };
        //tween naar scale
        Tween.prototype.tweenScale = function (to, callback, context, tweenEasing) {
            this.tweenStop();
            this._mTween = this.mGame.add.tween(this._mTransform.mScale);
            //start de tween
            this.tweenStart(to, callback, context, tweenEasing);
        };
        //tween naar position
        Tween.prototype.tweenPosition = function (to, callback, context, tweenEasing) {
            this.tweenStop();
            this._mTween = this.mGame.add.tween(this._mTransform.mPosition);
            //start de tween
            this.tweenStart(to, callback, context, tweenEasing);
        };
        //word alleen gebruikt bij x en y bijv position en scale
        Tween.prototype.tweenStart = function (to, callback, context, tweenEasing) {
            //check of we easing hebben
            if (Helper.exists(tweenEasing) === false) {
                tweenEasing = Phaser.Easing.Elastic.InOut;
            }
            //check of we callback en context hebben
            if (Helper.exists(callback) && Helper.exists(context)) {
                this._mTween.to({ x: to.x, y: to.y }, this._mTime, tweenEasing);
                this._mTween.onComplete.add(callback, context);
                this._mTween.start();
            }
            else {
                this._mTween.to({ x: to.x, y: to.y }, this._mTime, tweenEasing, true);
            }
        };
        Tween.prototype.tweenStop = function (complete) {
            if (Helper.exists(this._mTween)) {
                this._mTween.stop(complete || false);
                this.mGame.tweens.remove(this._mTween);
            }
            this._mTween = null;
        };
        Tween.prototype.tweenPause = function () {
            if (Helper.exists(this._mTween)) {
                if (this._mTween.isPaused === false) {
                    this._mTween.pause();
                }
            }
        };
        Tween.prototype.tweenResume = function () {
            if (Helper.exists(this._mTween)) {
                if (this._mTween.isPaused) {
                    this._mTween.resume();
                }
            }
        };
        Tween.prototype.tweenDispose = function (complete) {
            if (Helper.exists(this._mTween)) {
                this._mTween.onComplete.removeAll();
                this._mTween.stop(complete || false);
                this.mGame.tweens.remove(this._mTween);
            }
            this._mTween = null;
        };
        Object.defineProperty(Tween.prototype, "isTweening", {
            get: function () {
                if (Helper.exists(this._mTween) === false) {
                    return false;
                }
                else {
                    return this._mTween.isRunning;
                }
            },
            set: function (value) { },
            enumerable: true,
            configurable: true
        });
        Tween.prototype.destroy = function () {
            this.tweenDispose();
            _super.prototype.destroy.call(this);
            this._mTransform = null;
            this._mTime = null;
        };
        return Tween;
    }(Dlib.Dcomponent));
    Dlib.Tween = Tween;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Button = (function (_super) {
        __extends(Button, _super);
        //button callback:
        //context naam of object
        //callback is functie
        function Button(iButton, iImage) {
            _super.call(this, "Button");
            //callback, context en sound
            this._mCallbackFunction = iButton.mCallback;
            this._mContext = iButton.mContext;
            this._mSoundEffect = iButton.mSoundEffect;
            //button image info
            this._mKey = iImage.mKey;
            this._mSheet = iImage.mSheet;
            this._mAnchor = iImage.mAnchor;
            this._mGroup = iImage.mGroup;
        }
        Button.prototype.create = function () {
            _super.prototype.create.call(this);
            this._mTransform = this.mDobject.mTransform;
            this.setImage(this._mKey, this._mSheet, this._mAnchor, this._mGroup);
            this._mTransform.mRenderObject = this._mButton;
        };
        Button.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            //remove from group
            if (Helper.exists(this._mGroup)) {
                this._mGroup.remove(this._mButton);
                this._mGroup = null;
            }
            //destroy button
            this._mButton.destroy();
            this._mButton = null;
            //null callback / context
            this._mCallbackFunction = null;
            this._mContext = null;
            //null other
            this._mKey = null;
            this._mSheet = null;
            this._mAnchor = null;
            this._mTransform = null;
        };
        Button.prototype.setImage = function (key, sheet, anchor, group) {
            if (!Helper.exists(sheet)) {
                sheet = this._mSheet;
            }
            else {
                this._mSheet = sheet;
            }
            if (!Helper.exists(anchor)) {
                anchor = this._mAnchor;
            }
            else {
                this._mAnchor = anchor;
            }
            if (!Helper.exists(group)) {
                group = this._mGroup;
            }
            var lAnchor;
            if (Helper.exists(anchor) === false) {
                lAnchor = new Phaser.Point(0.5, 0.5);
            }
            else {
                lAnchor = anchor;
            }
            var up = key + "0";
            var down = key + "1";
            var over = key + "2";
            if (Helper.exists(this._mButton) === false) {
                //check of het een object is
                if (typeof this._mContext === "object") {
                    if (Helper.exists(sheet)) {
                        this._mButton = this.mGame.add.button(0, 0, sheet, this.callContext, this, over, up, down);
                    }
                    else {
                        this._mButton = this.mGame.add.button(0, 0, up, this.callContext, this, over, up, down);
                    }
                }
                else {
                    if (Helper.exists(sheet)) {
                        this._mButton = this.mGame.add.button(0, 0, sheet, this.callObject, this, over, up, down);
                    }
                    else {
                        this._mButton = this.mGame.add.button(0, 0, up, this.callObject, this, over, up, down);
                    }
                }
            }
            else {
                if (Helper.exists(sheet)) {
                    if (this._mButton.key !== sheet) {
                        this._mButton.loadTexture(sheet);
                    }
                    this._mButton.setFrames(over, up, down, up);
                }
                else {
                    this._mButton.loadTexture(key);
                }
            }
            this._mButton.anchor = lAnchor;
            //voeg button toe aan groep
            if (Helper.exists(group)) {
                this._mGroup = group;
                this._mGroup.add(this._mButton);
            }
        };
        Button.prototype.callObject = function () {
            if (this.allowedInput() === false) {
                return;
            }
            //haal object op
            var lDobject = Dlib.Dcore.mInstance.findObjectByName(this._mContext);
            //check of het object wel de functie heeft
            if (Helper.exists(lDobject[this._mCallbackFunction])) {
                //speel geluidje af
                Dlib.Daudio.mInstance.playOnce(this._mSoundEffect);
                //roep functie aan
                lDobject[this._mCallbackFunction]();
            }
            else {
                throw new Error("Button.ts: Call Object, NO OBJECT!");
            }
        };
        Button.prototype.callContext = function () {
            if (this.allowedInput() === false) {
                return;
            }
            //check of callback bestaat
            if (Helper.exists(this._mContext[this._mCallbackFunction])) {
                //speel geluidje af
                Dlib.Daudio.mInstance.playOnce(this._mSoundEffect);
                //roep functie aan
                this._mContext[this._mCallbackFunction]();
            }
            else {
                throw Error("Button.st: Call Context, NO CONTEXT!");
            }
        };
        Button.prototype.allowedInput = function () {
            if (this.mDobject.hasComponent("Tween")) {
                if (this.mDobject.getComponent("Tween").isTweening) {
                    return false;
                }
            }
            if (Dlib.Dpause.mInstance.mFullPause) {
                return false;
            }
            return true;
        };
        Button.prototype.enable = function () {
            _super.prototype.enable.call(this);
            this._mButton.revive();
        };
        Button.prototype.disable = function () {
            _super.prototype.disable.call(this);
            this._mButton.kill();
        };
        Object.defineProperty(Button.prototype, "mPosition", {
            set: function (position) {
                if (Helper.exists(this._mButton)) {
                    this._mButton.position = position;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "mScale", {
            set: function (scale) {
                if (Helper.exists(this._mButton)) {
                    this._mButton.scale = scale;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "mRotation", {
            set: function (rotation) {
                if (Helper.exists(this._mButton)) {
                    this._mButton.rotation = rotation;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "mButton", {
            get: function () {
                return this._mButton;
            },
            enumerable: true,
            configurable: true
        });
        Button.prototype.notify = function (message) {
            _super.prototype.notify.call(this, message);
            switch (message) {
                case "PositionChanged":
                    this.mPosition = this._mTransform.mPosition;
                    break;
                case "ScaleChanged":
                    this.mScale = this._mTransform.mScale;
                    break;
                case "RotationChanged":
                    this.mRotation = Phaser.Math.degToRad(this._mTransform.mRotation);
                    break;
                case "ToTop":
                    this._mButton.bringToTop();
                    break;
            }
        };
        return Button;
    }(Dlib.Dcomponent));
    Dlib.Button = Button;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var GuiButton = (function (_super) {
        __extends(GuiButton, _super);
        function GuiButton(name, iButton, guiTransformInterface, imageInterface) {
            _super.call(this, name);
            this._mIButton = iButton;
            this._mIGuiTransformInterface = guiTransformInterface;
            this._mIImageInterface = imageInterface;
        }
        GuiButton.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            //maak components aan
            this._mGuiTransform = this.addComponent(new Dlib.GuiTransform(this._mIGuiTransformInterface));
            this._mButton = this.addComponent(new Dlib.Button(this._mIButton, this._mIImageInterface));
            this._mTween = this.addComponent(new Dlib.Tween(this._mIGuiTransformInterface.mTweenSpeed));
            //set image op correcte positie
            this.mTransform.mScale = this._mGuiTransform.calculateScaleFromSize(new Phaser.Point(this._mButton.mButton.width, this._mButton.mButton.height));
            this.mTransform.mPosition = this._mGuiTransform.mPosition;
        };
        //todo tween in moet somehow anders zit op image, button en text
        GuiButton.prototype.tweenIn = function () {
            this.mTransform.mPosition = this._mGuiTransform.calculateOutofScreenPosition(new Phaser.Point(this._mButton.mButton.width, this._mButton.mButton.height));
            this._mTween.tweenPosition(this._mGuiTransform.mPosition, null, null, Phaser.Easing.Back.Out);
        };
        GuiButton.prototype.tweenOut = function (callback, context) {
            this._mTween.tweenPosition(this._mGuiTransform.calculateOutofScreenPosition(new Phaser.Point(this._mButton.mButton.width, this._mButton.mButton.height)), callback, context, Phaser.Easing.Back.In);
        };
        GuiButton.prototype.setButton = function (imageInterface) {
            this._mButton.setImage(imageInterface.mKey, imageInterface.mSheet, imageInterface.mAnchor, imageInterface.mGroup);
            this.mTransform.mScale = new Phaser.Point(1, 1);
            this.mTransform.mScale = this._mGuiTransform.calculateScaleFromSize(new Phaser.Point(this._mButton.mButton.width, this._mButton.mButton.height));
            this.mTransform.mPosition = this._mGuiTransform.mPosition;
        };
        GuiButton.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            //components
            this._mGuiTransform = null;
            this._mButton = null;
            this._mTween = null;
            //button
            this._mIButton = null;
            //interfaces voor image en GuiTransform
            this._mIGuiTransformInterface = null;
            this._mIImageInterface = null;
        };
        return GuiButton;
    }(Dlib.Dobject));
    Dlib.GuiButton = GuiButton;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var GuiImage = (function (_super) {
        __extends(GuiImage, _super);
        function GuiImage(name, guiTransformInterface, imageInterface) {
            _super.call(this, name);
            this._mIGuiTransformInterface = guiTransformInterface;
            this._mIImageInterface = imageInterface;
        }
        GuiImage.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            //maak guitransform
            //maak image
            //maak tween
            this._mGuiTransform = this.addComponent(new Dlib.GuiTransform(this._mIGuiTransformInterface));
            this._mImage = this.addComponent(new Dlib.Image(this._mIImageInterface));
            this._mTween = this.addComponent(new Dlib.Tween(this._mIGuiTransformInterface.mTweenSpeed));
            //set image op correcte positie
            this.mTransform.mScale = this._mGuiTransform.calculateScaleFromSize(new Phaser.Point(this._mImage.mImage.width, this._mImage.mImage.height));
            this.mTransform.mPosition = this._mGuiTransform.mPosition;
        };
        //todo tween in moet somehow anders zit op image, button en text
        GuiImage.prototype.tweenIn = function () {
            this.mTransform.mPosition = this._mGuiTransform.calculateOutofScreenPosition(new Phaser.Point(this._mImage.mImage.width, this._mImage.mImage.height));
            this._mTween.tweenPosition(this._mGuiTransform.mPosition, null, null, Phaser.Easing.Back.Out);
        };
        GuiImage.prototype.tweenOut = function (callback, context) {
            this._mTween.tweenPosition(this._mGuiTransform.calculateOutofScreenPosition(new Phaser.Point(this._mImage.mImage.width, this._mImage.mImage.height)), callback, context, Phaser.Easing.Back.In);
        };
        GuiImage.prototype.setImage = function (imageInterface) {
            this._mImage.setImage(imageInterface.mKey, imageInterface.mSheet, imageInterface.mAnchor, imageInterface.mGroup);
            this.mTransform.mScale = new Phaser.Point(1, 1);
            this.mTransform.mScale = this._mGuiTransform.calculateScaleFromSize(new Phaser.Point(this._mImage.mImage.width, this._mImage.mImage.height));
            this.mTransform.mPosition = this._mGuiTransform.mPosition;
        };
        //cleanup
        GuiImage.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mGuiTransform = null;
            this._mImage = null;
            this._mTween = null;
            this._mIGuiTransformInterface = null;
            this._mIImageInterface = null;
        };
        return GuiImage;
    }(Dlib.Dobject));
    Dlib.GuiImage = GuiImage;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    //todo test webfont
    //todo maak een localization tool 
    var GuiText = (function (_super) {
        __extends(GuiText, _super);
        function GuiText(name, iGuiTransform, iGuiText, iText, iWebfont) {
            _super.call(this, name);
            this._mIText = iText;
            this._mIWebfont = iWebfont;
            this._mIGuiTransformInterface = iGuiTransform;
            this._mIGuitext = iGuiText;
        }
        GuiText.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            //maak components aan
            this._mGuiTransform = this.addComponent(new Dlib.GuiTransform(this._mIGuiTransformInterface));
            this._mText = this.addComponent(new Dlib.Text(this._mIText, this._mIWebfont));
            this._mTween = this.addComponent(new Dlib.Tween(this._mIGuiTransformInterface.mTweenSpeed));
            //set image op correcte positie
            this.mTransform.mScale = this._mGuiTransform.calculateScaleFromSize(new Phaser.Point(this._mText.mText.width, this._mText.mText.height));
            this.mTransform.mPosition = this._mGuiTransform.mPosition;
        };
        //todo tween in moet somehow anders zit op image, button en text
        GuiText.prototype.tweenIn = function () {
            this.mTransform.mPosition = this._mGuiTransform.calculateOutofScreenPosition(new Phaser.Point(this._mText.mText.width, this._mText.mText.height));
            this._mTween.tweenPosition(this._mGuiTransform.mPosition, null, null, Phaser.Easing.Back.Out);
        };
        GuiText.prototype.tweenOut = function (callback, context) {
            this._mTween.tweenPosition(this._mGuiTransform.calculateOutofScreenPosition(new Phaser.Point(this._mText.mText.width, this._mText.mText.height)), callback, context, Phaser.Easing.Back.In);
        };
        GuiText.prototype.update = function () {
            _super.prototype.update.call(this);
            //moeten een variable aflezen van een object
            if (this._mIGuitext.mReadData) {
                //sla tijdelijk data in op
                var lData;
                if (typeof this._mIGuitext.mContext === "string") {
                    //OPTIMIZE zorg er voor dat een refference gemaakt wordt
                    var lObject = Dlib.Dcore.mInstance.findObjectByName(this._mIGuitext.mContext);
                    if (lObject.hasOwnProperty(this._mIGuitext.mVariable)) {
                        //vind object
                        lData = Dlib.Dcore.mInstance.findObjectByName(this._mIGuitext.mContext)[this._mIGuitext.mVariable];
                    }
                    else {
                        lData = null;
                    }
                }
                else {
                    if (this._mIGuitext.mContext.hasOwnProperty(this._mIGuitext.mVariable)) {
                        //vind object
                        lData = this._mIGuitext.mContext[this._mIGuitext.mVariable];
                    }
                    else {
                        lData = null;
                    }
                }
                if (Helper.exists(lData)) {
                    //check of het een nummer is en convert naar string
                    if (typeof lData === "number") {
                        lData = lData.toString();
                    }
                    //check of ldata nu wel string is zo niet error uit
                    if (typeof lData !== "string") {
                        console.log("GuiText.ts: lData not string!");
                        return;
                    }
                    //set text
                    this.setText(lData);
                }
                else {
                    this.setText("");
                }
            }
            if (this._mIGuitext.mLocalization) {
            }
            //this.mTransform.mPosition = this._mGuiTransform.mPosition;
        };
        GuiText.prototype.setText = function (text) {
            //check of de huidige text niet het zelfde is
            if (this._mText.mText.text === text) {
                return;
            }
            //verander de text
            this._mText.mText.text = text;
            //fix scale
            this.mTransform.mScale = new Phaser.Point(1, 1);
            //this.mTransform.mScale = this._mGuiTransform.calculateScaleFromSize(new Phaser.Point(this._mText.mText.width, this._mText.mText.height));
            //this.mTransform.mPosition = this._mGuiTransform.mPosition;
            this.scaleToFit();
        };
        GuiText.prototype.scaleToFit = function () {
            var loop = true;
            if (this._mText.mText.height > this._mGuiTransform.mSize.y) {
                while (loop) {
                    this._mText.mFontSize -= 1;
                    if (this._mText.mText.height < this._mGuiTransform.mSize.y) {
                        loop = false;
                    }
                }
            }
            else {
                while (loop) {
                    this._mText.mFontSize += 1;
                    if (this._mText.mText.height > this._mGuiTransform.mSize.y || this._mText.mText.width > this._mGuiTransform.mSize.x) {
                        this._mText.mFontSize -= 2;
                        loop = false;
                    }
                }
            }
            loop = true;
            if (this._mText.mText.width > this._mGuiTransform.mSize.x) {
                while (loop) {
                    this._mText.mFontSize -= 1;
                    if (this._mText.mText.width < this._mGuiTransform.mSize.x) {
                        loop = false;
                    }
                }
            }
            else {
                while (loop) {
                    this._mText.mFontSize += 1;
                    if (this._mText.mText.width > this._mGuiTransform.mSize.x || this._mText.mText.height > this._mGuiTransform.mSize.y) {
                        this._mText.mFontSize -= 2;
                        loop = false;
                    }
                }
            }
        };
        GuiText.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mGuiTransform = null;
            this._mText = null;
            this._mTween = null;
            //interfaces
            this._mIText = null;
            this._mIWebfont = null;
            this._mIGuiTransformInterface = null;
            this._mIGuitext = null;
        };
        return GuiText;
    }(Dlib.Dobject));
    Dlib.GuiText = GuiText;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var GuiView = (function (_super) {
        __extends(GuiView, _super);
        function GuiView(viewName, stateContext) {
            //super(viewName);
            _super.call(this, "GuiView");
            this._mSceneName = viewName;
            this._mGuiObjects = new Array();
            this._mStateContext = stateContext;
            this._mOrientation = Dlib.Dscreen.mInstance.mRotation;
        }
        GuiView.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            this.createGui();
        };
        GuiView.prototype.createGui = function () {
            //haal json binnen
            this._mGuiJSON = this._mGame.cache.getJSON("GUI");
            //check of er wel scenes zijn
            if (Helper.exists(this._mGuiJSON.Scenes) === false) {
                throw new Error("GuiView.ts No Scenes found!");
            }
            var lScene = null;
            //loop door de scenes en check of we de scene name kunnen vinden
            for (var i = 0; i < this._mGuiJSON.Scenes.length; i++) {
                if (this._mGuiJSON.Scenes[i].SceneName === this._mSceneName) {
                    lScene = this._mGuiJSON.Scenes[i];
                }
            }
            //check of we de scene hadden kunnen vinden
            if (Helper.exists(lScene) === false) {
                throw new Error("GuiView.ts No Scene found!");
            }
            //loop door de elementen en maak ze aan
            for (var j = 0; j < lScene.Elements.length; j++) {
                this.createGuiElement(lScene.Elements[j]);
            }
            this.sortLayers();
        };
        GuiView.prototype.createGuiElement = function (element) {
            var lDobjectName = element.Name;
            var lType = element.Type;
            //haal gui later binnen
            var lGuiLayer = Dlib.Dlayer.mInstance.getLayer("Gui");
            //maak gui transform aan
            var lGuiTransform = {
                mPortraitAnchor1: new Phaser.Point(element.Transform.Portrait.Anchor1.x, element.Transform.Portrait.Anchor1.y),
                mPortraitAnchor2: new Phaser.Point(element.Transform.Portrait.Anchor2.x, element.Transform.Portrait.Anchor2.y),
                mLandscapeAnchor1: new Phaser.Point(element.Transform.Landscape.Anchor1.x, element.Transform.Landscape.Anchor1.y),
                mLandscapeAnchor2: new Phaser.Point(element.Transform.Landscape.Anchor2.x, element.Transform.Landscape.Anchor2.y),
                mAlignment: new Phaser.Point(element.Transform.Alignment.x, element.Transform.Alignment.y),
                mOrientation: this._mOrientation,
                mLayer: element.Transform.Layer,
                mTweenSpeed: this._mGuiJSON.TweenSpeed,
                mDebug: this._mGuiJSON.Debug
            };
            //check wat voor type
            switch (lType) {
                case "Image":
                    var lImageInterface = {
                        mKey: element.Image.Key,
                        mSheet: element.Image.SpriteSheet,
                        mAnchor: new Phaser.Point(element.Image.Anchor.x, element.Image.Anchor.y),
                        mGroup: lGuiLayer
                    };
                    //maak nieuw GuiImage
                    this._mGuiObjects.push(Dlib.Dcore.mInstance.createDobject(new Dlib.GuiImage(lDobjectName, lGuiTransform, lImageInterface)));
                    break;
                case "Button":
                    //maak image interface voor de button
                    var lImageInterface = {
                        mKey: element.Image.Key,
                        mSheet: element.Image.SpriteSheet,
                        mAnchor: new Phaser.Point(element.Image.Anchor.x, element.Image.Anchor.y),
                        mGroup: lGuiLayer
                    };
                    //maak button interface
                    var lButtonInterface = {
                        mCallback: element.Button.Callback,
                        mContext: null,
                        mSoundEffect: element.Button.SoundEffect
                    };
                    //check of we find object moeten doen of state context moeten gebruiken
                    if (element.Button.FindObject) {
                        lButtonInterface.mContext = element.Button.Context; //string
                    }
                    else {
                        lButtonInterface.mContext = this._mStateContext; //object
                    }
                    //maak nieuwe GuiButton aan
                    this._mGuiObjects.push(Dlib.Dcore.mInstance.createDobject(new Dlib.GuiButton(lDobjectName, lButtonInterface, lGuiTransform, lImageInterface)));
                    break;
                case "Text":
                    //maak alle interfaces aan
                    var lText = {
                        mGroup: lGuiLayer,
                        mFont: element.Text.Font,
                        mAnchor: new Phaser.Point(element.Text.Anchor.x, element.Text.Anchor.y)
                    };
                    var lGuiText = {
                        mLocalization: element.Text.GuiText.Localization,
                        mKey: element.Text.GuiText.Key,
                        mReadData: element.Text.GuiText.ReadData,
                        mContext: element.Text.GuiText.Context,
                        mVariable: element.Text.GuiText.Variable
                    };
                    var lWebFont = {
                        mFill: element.Text.WebFont.Fill,
                        mStroke: element.Text.WebFont.Stroke,
                        mStrokeThickness: element.Text.WebFont.StrokeThickness
                    };
                    //als we bitfonts gebruken moet lwebfont op null zo dat text component bitmap gebruikt
                    if (element.Text.UseBitmapFont) {
                        lWebFont = null;
                    }
                    if (Helper.exists(lGuiText.mContext) === false) {
                        lGuiText.mContext = this._mStateContext;
                    }
                    //maak text aan
                    this._mGuiObjects.push(Dlib.Dcore.mInstance.createDobject(new Dlib.GuiText(lDobjectName, lGuiTransform, lGuiText, lText, lWebFont)));
                    break;
                case "Sprite":
                    var lImageInterface = {
                        mKey: element.Image.Key,
                        mSheet: element.Image.SpriteSheet,
                        mAnchor: new Phaser.Point(element.Image.Anchor.x, element.Image.Anchor.y),
                        mGroup: lGuiLayer
                    };
                    var lAnimationInfo = {
                        mAllFrames: element.AnimationInfo.AllFrames,
                        mCallback: null,
                        mContext: null,
                        mFps: element.AnimationInfo.Fps,
                        mPrefix: element.AnimationInfo.Prefix,
                        mStart: element.AnimationInfo.Start,
                        mStop: element.AnimationInfo.Stop,
                        mSuffix: element.AnimationInfo.Suffix,
                        mZeroPad: element.AnimationInfo.ZeroPad
                    };
                    this._mGuiObjects.push(Dlib.Dcore.mInstance.createDobject(new Dlib.GuiSprite(lDobjectName, lGuiTransform, lImageInterface)));
                    var lGuiSprite = this._mGuiObjects[this._mGuiObjects.length - 1];
                    lGuiSprite.addAnimation(lAnimationInfo);
                    if (element.AnimationPlay.PlayOnSpawn) {
                        if (element.AnimationPlay.Loop) {
                            lGuiSprite.playAnimation(true);
                        }
                        else {
                            lGuiSprite.playAnimation(false);
                        }
                    }
                    break;
                default:
                    console.log("GuiView.TS: Error no gui element defined");
            }
        };
        GuiView.prototype.clearGui = function () {
            //clear all gui elements
            while (this._mGuiObjects.length > 0) {
                Dlib.Dcore.mInstance.removeDobject(this._mGuiObjects.splice(0, 1)[0]);
            }
        };
        GuiView.prototype.resize = function () {
            if (this._mOrientation === Dlib.Dscreen.mInstance.mRotation) {
                var lGuiTransform;
                //loop door alle gui elementen en resize die.
                for (var i = 0; i < this._mGuiObjects.length; i++) {
                    lGuiTransform = this._mGuiObjects[i].getComponent("GuiTransform");
                    lGuiTransform["resize"]();
                    this._mGuiObjects[i].mTransform.mPosition = lGuiTransform["mPosition"];
                }
            }
            else {
                this._mOrientation = Dlib.Dscreen.mInstance.mRotation;
                this.clearGui();
                this.createGui();
            }
        };
        GuiView.prototype.sortLayers = function () {
            var lHighsestLayer = 0;
            var lSortArray = [];
            //loop door alle gui elementen heen en check welke de hoogste layer heeft
            for (var i = 0; i < this._mGuiObjects.length; i++) {
                if (this._mGuiObjects[i].getComponent(Dlib.GuiTransform).mLayer > lHighsestLayer) {
                    lHighsestLayer = this._mGuiObjects[i].getComponent(Dlib.GuiTransform).mLayer;
                }
            }
            //maak aan de hand van hoeveel layers er zijn arrays aan
            for (var j = 0; j <= lHighsestLayer; j++) {
                lSortArray.push(new Array());
            }
            //loop door alle elementen en stop ze in de correcte array
            for (var k = 0; k < this._mGuiObjects.length; k++) {
                lSortArray[this._mGuiObjects[k].getComponent(Dlib.GuiTransform).mLayer].push(this._mGuiObjects[k].getComponent(Dlib.GuiTransform));
            }
            //breng alle gui elementen naar de top
            for (var l = 0; l < lSortArray.length; l++) {
                for (var m = 0; m < lSortArray[l].length; m++) {
                    lSortArray[l][m].toTop();
                }
            }
            lSortArray = null;
            lHighsestLayer = null;
        };
        GuiView.prototype.tweenIn = function () {
            //tween alle elementen in
            for (var i = 0; i < this._mGuiObjects.length; i++) {
                this._mGuiObjects[i]["tweenIn"]();
            }
        };
        GuiView.prototype.tweenOut = function (callback, context, name) {
            //maak callback signal en check hoeveel elemeten verwijderd moeten worden
            this._mCallback = new Phaser.Signal();
            this._mCallback.addOnce(callback, context, null, name);
            this._mCompletedTweens = 0;
            this._mTotalTweens = this._mGuiObjects.length;
            //tween alles uit
            for (var i = 0; i < this._mGuiObjects.length; i++) {
                this._mGuiObjects[i]["tweenOut"](this.tweenComplete, this);
            }
        };
        //voor elk element dat weg tweent complete het
        GuiView.prototype.tweenComplete = function () {
            this._mCompletedTweens++;
            //als alle elementen uit getweent zijn dipatch callback
            if (this._mTotalTweens === this._mCompletedTweens) {
                this._mCallback.dispatch();
            }
        };
        GuiView.prototype.overlapGui = function () {
            for (var i = 0; i < this._mGuiObjects.length; i++) {
                if (this._mGuiObjects[i] instanceof Dlib.GuiButton) {
                    if (this._mGuiObjects[i].getComponent("Button").mButton.input.pointerDown()) {
                        return true;
                    }
                }
            }
            return false;
        };
        GuiView.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mGuiObjects = null;
            this._mGuiJSON = null;
            if (Helper.exists(this._mCallback)) {
                this._mCallback.dispose();
                this._mCallback = null;
            }
            this._mCompletedTweens = null;
            this._mTotalTweens = null;
        };
        return GuiView;
    }(Dlib.Dobject));
    Dlib.GuiView = GuiView;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var PreloadBackground = (function (_super) {
        __extends(PreloadBackground, _super);
        function PreloadBackground() {
            _super.call(this, "PreloadBackground");
            this._mCenterPoint = new Phaser.Point();
        }
        PreloadBackground.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            this.addComponent(new Dlib.Image({
                mKey: "PreloadBackground",
                mGroup: null,
                mAnchor: new Phaser.Point(0.5, 0.5),
                mSheet: null
            }));
        };
        PreloadBackground.prototype.update = function () {
            _super.prototype.update.call(this);
            //center image
            this._mCenterPoint.x = this._mGame.width / 2;
            this._mCenterPoint.y = (this._mGame.height / 2);
            this.mTransform.mPosition = this._mCenterPoint;
        };
        PreloadBackground.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mCenterPoint = null;
        };
        return PreloadBackground;
    }(Dlib.Dobject));
    Dlib.PreloadBackground = PreloadBackground;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var PreloadCircle = (function (_super) {
        __extends(PreloadCircle, _super);
        function PreloadCircle() {
            _super.call(this, "PreloadCircle");
            this._mCenterPoint = new Phaser.Point();
        }
        PreloadCircle.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            this.addComponent(new Dlib.Image({
                mKey: "PreloadCircle",
                mGroup: null,
                mAnchor: new Phaser.Point(0.5, 0.5),
                mSheet: null
            }));
        };
        PreloadCircle.prototype.update = function () {
            _super.prototype.update.call(this);
            this._mCenterPoint.x = this._mGame.width / 2;
            this._mCenterPoint.y = (this._mGame.height / 2) + 200;
            this.mTransform.mPosition = this._mCenterPoint;
        };
        PreloadCircle.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mCenterPoint = null;
        };
        return PreloadCircle;
    }(Dlib.Dobject));
    Dlib.PreloadCircle = PreloadCircle;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var PreloadSpinner = (function (_super) {
        __extends(PreloadSpinner, _super);
        function PreloadSpinner() {
            _super.call(this, "PreloadSpinner");
            this._mCenterPoint = new Phaser.Point();
        }
        PreloadSpinner.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            this.addComponent(new Dlib.Image({
                mKey: "PreloadSpinner",
                mGroup: null,
                mAnchor: new Phaser.Point(0.5, 0.5),
                mSheet: null
            }));
        };
        PreloadSpinner.prototype.update = function () {
            _super.prototype.update.call(this);
            this._mCenterPoint.x = this._mGame.width / 2;
            this._mCenterPoint.y = (this._mGame.height / 2) + 200;
            this.mTransform.mPosition = this._mCenterPoint;
            this.mTransform.mRotation += 10;
        };
        PreloadSpinner.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mCenterPoint = null;
        };
        return PreloadSpinner;
    }(Dlib.Dobject));
    Dlib.PreloadSpinner = PreloadSpinner;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Boot = (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            _super.apply(this, arguments);
        }
        Boot.prototype.init = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.prototype.init.call(this, args);
            //maak de Dcore aan als aller eerste!
            new Dlib.Dcore(this.game);
        };
        Boot.prototype.preload = function () {
            _super.prototype.preload.call(this);
            //todo een manier bedenken om makkelijk logo's van publishers toe te voegen aan het begin
            //laad in de standaard preload assets
            this.game.load.image("PreloadBackground", "assets/PreloadBackground.png");
            this.game.load.image("PreloadCircle", "assets/PreloadCircle.png");
            this.game.load.image("PreloadSpinner", "assets/PreloadSpinner.png");
            this.game.load.json("Preload", "json/Preload.json");
            this.game.load.json("Settings", "json/Settings.json");
        };
        Boot.prototype.create = function () {
            _super.prototype.create.call(this);
            var lSettingsJSON = this.game.cache.getJSON("Settings");
            //check of de json file er wel is
            if (Helper.exists(lSettingsJSON) === false) {
                console.warn("NO settings json!");
                //Maak eigen settings aan
                lSettingsJSON = {
                    "MobilePointers": 1,
                    "AntiAlias": false,
                    "DesiredFPS": 60,
                    "SaveID": "DefaultGobletGames",
                    "Orientation": "Landscape",
                    "Layers": ["Gui"]
                };
            }
            ///////AUDIO
            new Dlib.Daudio(this.game);
            ///////SAVE
            new Dlib.Dsave(lSettingsJSON.SaveID);
            ///////LAYERS
            new Dlib.Dlayer(this.game);
            //loop door layers om ze aan te maken
            //maak index 0 aan voor de eerste layer
            var layerIndex = 0;
            for (var layer in lSettingsJSON.Layers) {
                //maak de layer aan
                Dlib.Dlayer.mInstance.makeLayer(lSettingsJSON.Layers[layer], layerIndex);
                //tel een bij de index op voor de layer sorting
                layerIndex++;
            }
            ////////SCREEN
            var lOrientation;
            //check wat de orientatie moet zijn
            //de default is landscape met warning
            switch (lSettingsJSON.Orientation) {
                case "Portrait":
                    lOrientation = Dlib.ROTATION.PORTRAIT;
                    break;
                case "Landscape":
                    lOrientation = Dlib.ROTATION.LANDSCAPE;
                    break;
                case "Both":
                    lOrientation = Dlib.ROTATION.BOTH;
                    break;
                case "Lock":
                    lOrientation = Dlib.ROTATION.LOCK;
                    break;
                default:
                    lOrientation = Dlib.ROTATION.BOTH;
                    console.warn("No orientation set!");
            }
            //maak screen handler aan
            new Dlib.Dscreen(this.game, lOrientation);
            //fix de scherm groote
            //Dscreen.mInstance.screenUpdated();
            ////////OTHER
            this.game.antialias = lSettingsJSON.AntiAlias;
            this.game.time.desiredFps = lSettingsJSON.DesiredFPS;
            if (this.game.device.desktop) {
                this.input.maxPointers = 1;
            }
            else {
                this.input.maxPointers = lSettingsJSON.MobilePointers;
            }
            //maak preload Dobjecten voor mooi laadscherm
            Dlib.Dcore.mInstance.createDobject(new Dlib.PreloadBackground());
            Dlib.Dcore.mInstance.createDobject(new Dlib.PreloadCircle());
            Dlib.Dcore.mInstance.createDobject(new Dlib.PreloadSpinner());
            //update alle objecten teminste een keer
            Dlib.Dcore.mInstance.updateDobjects();
            ///////PAUSE
            new Dlib.Dpause(this.game);
            this.game.state.start("Preload", false);
        };
        return Boot;
    }(Phaser.State));
    Dlib.Boot = Boot;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Preload = (function (_super) {
        __extends(Preload, _super);
        function Preload() {
            _super.apply(this, arguments);
        }
        Preload.prototype.init = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.prototype.init.call(this, args);
            this._mAudioComplete = false;
            this._mFilesComplete = false;
        };
        Preload.prototype.preload = function () {
            //voeg listeners toe voor errors en complete
            this.game.load.onFileComplete.add(this.fileComplete, this);
            this.game.load.onFileError.add(this.fileError, this);
            //haal de preload json op
            var preloadjson = this.game.cache.getJSON("Preload");
            //check of we json file hebben
            if (Helper.exists(preloadjson) === false) {
                console.error("No preload json found!");
            }
            //laad alle assets in
            this.loadSprites(preloadjson["Sprites"]);
            this.loadSheets(preloadjson["Sheets"]);
            this.loadAudio(preloadjson["Audio"]);
            this.loadBitmapFont(preloadjson["BitmapFont"]);
            //laad de gui in
            this.game.load.json("GUI", "json/Gui.json");
            //laad audio tags in
            this.game.load.json("AudioTags", "json/AudioTags.json");
        };
        //[key, sprite]
        Preload.prototype.loadSprites = function (spriteArray) {
            for (var i = 0; i < spriteArray.length; i++) {
                this.game.load.image(spriteArray[i][0], spriteArray[i][1]);
            }
        };
        //[key, sheet, json]
        Preload.prototype.loadSheets = function (sheetArray) {
            for (var i = 0; i < sheetArray.length; i++) {
                this.game.load.atlasJSONArray(sheetArray[i][0], sheetArray[i][1], sheetArray[i][2]);
            }
        };
        //[key, mp3, ogg]
        Preload.prototype.loadAudio = function (audioArray) {
            //check of er audio is en of audio array gevuld is
            if (this.game.sound.noAudio || audioArray.length === 0) {
                this.audioDecoded();
                return;
            }
            //onthoud de namen van de audio die geladen gaat worden
            var lAudioNames = [];
            //loop door alle audio files en laad ze in
            for (var i = 0; i < audioArray.length; i++) {
                lAudioNames.push(audioArray[i][0]);
                this.game.load.audio(audioArray[i][0], [audioArray[i][1], audioArray[i][2]], true);
            }
            //maak een callback voor als alle audio gedecode is
            this.game.sound.setDecodedCallback(lAudioNames, this.audioDecoded, this);
        };
        //[key,image,json/xml]
        Preload.prototype.loadBitmapFont = function (bitmapFont) {
            for (var i = 0; i < bitmapFont.length; i++) {
                this.game.load.bitmapFont(bitmapFont[i][0], bitmapFont[i][1], bitmapFont[i][2]);
            }
        };
        Preload.prototype.audioDecoded = function () {
            this._mAudioComplete = true;
        };
        //file complete debug print
        Preload.prototype.fileComplete = function (progress, key, success, totalLoaded, totalFiles) {
            console.log("FileComplete Key: " + key + " Success: " + success + " Progress: " + progress.toString());
        };
        //file error debug print
        Preload.prototype.fileError = function (key, file) {
            console.log("Key: " + key + " Type: " + file.type + " File: " + file.url);
            throw new Error('Failed to load: Key: ${key} Type: ${file.type} File: ${file.url}');
        };
        Preload.prototype.shutdown = function () {
            //verwijder Dobjecten
            Dlib.Dcore.mInstance.removeDobject(Dlib.Dcore.mInstance.findObjectByName("PreloadBackground"));
            Dlib.Dcore.mInstance.removeDobject(Dlib.Dcore.mInstance.findObjectByName("PreloadCircle"));
            Dlib.Dcore.mInstance.removeDobject(Dlib.Dcore.mInstance.findObjectByName("PreloadSpinner"));
            //clear preload assets
            this.game.cache.removeImage("PreloadBackground", true);
            this.game.cache.removeImage("PreloadCircle", true);
            this.game.cache.removeImage("PreloadSpinner", true);
            //remove preload json
            this.game.cache.removeJSON("Preload");
            this._mAudioComplete = null;
            this._mFilesComplete = null;
        };
        //preload is klaar
        Preload.prototype.create = function () {
            _super.prototype.create.call(this);
            this._mFilesComplete = true;
            //laad de audio tags in
            Dlib.Daudio.mInstance.loadTags("AudioTags");
        };
        //main update
        Preload.prototype.update = function () {
            _super.prototype.update.call(this);
            Dlib.Dcore.mInstance.updateDobjects();
            if (this._mAudioComplete && this._mFilesComplete) {
                //check of we startup state moeten hebben
                if (Helper.exists(this.game.cache.getJSON("Settings").StartupState)) {
                    this.game.state.start(this.game.cache.getJSON("Settings").StartupState, false);
                }
                else {
                    //default is menu
                    this.game.state.start("menu", false);
                }
            }
        };
        //update waneer je in de preload zit
        Preload.prototype.loadUpdate = function () {
            _super.prototype.loadUpdate.call(this);
            Dlib.Dcore.mInstance.updateDobjects();
        };
        return Preload;
    }(Phaser.State));
    Dlib.Preload = Preload;
})(Dlib || (Dlib = {}));
//todo Kijk of alle singletons(audio, layer,??) naar objecten kunnen zo dat ze opgezocht kunnen worden
var Dlib;
(function (Dlib_1) {
    var Dlib = (function (_super) {
        __extends(Dlib, _super);
        function Dlib(width, heigt, domElement) {
            if (width === void 0) { width = 800; }
            if (heigt === void 0) { heigt = 600; }
            if (domElement === void 0) { domElement = "gobletgames"; }
            _super.call(this, width, heigt, Phaser.AUTO, domElement);
            this.state.add("Boot", Dlib_1.Boot, false);
            this.state.add("Preload", Dlib_1.Preload, false);
            //boot wil je niet hebben omdat je dit van buiten af kan aan roepen en dan heb je meer controle over welke states worden aangeroepen
            //anders word het meteen in de constructor aangeroepen wat misschien niet wenselijk is
            //this.state.start("Boot", true);
        }
        return Dlib;
    }(Phaser.Game));
    Dlib_1.Dlib = Dlib;
})(Dlib || (Dlib = {}));
///<reference path="../library/phaser.d.ts"/> 
///<reference path="core/Dhelper.ts"/> 
///<reference path="core/Dobject.ts"/>
///<reference path="core/Dcomponent.ts"/>
///<reference path="core/Dcore.ts"/>
///<reference path="core/Dscreen.ts"/>
///<reference path="core/Dstate.ts"/>
///<reference path="core/Daudio.ts"/>
///<reference path="core/Dlayer.ts"/>
///<reference path="components/Transform.ts"/>
///<reference path="components/GuiTransform.ts"/>
///<reference path="components/Image.ts"/>
///<reference path="components/Sprite.ts"/>
///<reference path="components/Timer.ts"/>
///<reference path="components/Tween.ts"/>
///<reference path="components/Button.ts"/>
///<reference path="objects/gui/GuiButton.ts"/>
///<reference path="objects/gui/GuiImage.ts"/>
///<reference path="objects/gui/GuiText.ts"/>
///<reference path="objects/gui/GuiView.ts"/>
///<reference path="objects/PreloadBackground.ts"/>
///<reference path="objects/PreloadCircle.ts"/>
///<reference path="objects/PreloadSpinner.ts"/>
///<reference path="states/Boot.ts"/>
///<reference path="states/Preload.ts"/>
///<reference path="Dlib.ts"/> 
var Dlib;
(function (Dlib) {
    //todo als het een webfont is moet het in de achtergrond een keer gemaakt worden(preload) zo niet dan breekt het
    var Text = (function (_super) {
        __extends(Text, _super);
        function Text(iText, iWebfont) {
            _super.call(this, "Text");
            //check wat voor type font dit word
            //check of iwebfont bestaat
            //zoniet check of font in game.cache bestaat
            this._mIText = iText;
            if (Helper.exists(iWebfont)) {
                this._mUseBitmap = false;
                this._mIWebfont = iWebfont;
            }
            else {
                this._mUseBitmap = true;
            }
        }
        Text.prototype.create = function () {
            _super.prototype.create.call(this);
            this._mTransform = this.mDobject.mTransform;
            this.createText();
            this._mTransform.mRenderObject = this._mText;
        };
        Text.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (Helper.exists(this._mIText.mGroup)) {
                this._mIText.mGroup.remove(this._mText);
            }
            this._mText.destroy();
            this._mText = null;
            this._mIText = null;
            this._mIWebfont = null;
            this._mUseBitmap = null;
            this._mTransform = null;
        };
        Text.prototype.createText = function () {
            if (this._mUseBitmap) {
                if (this.mGame.cache.checkBitmapFontKey(this._mIText.mFont)) {
                    this._mText = this.mGame.add.bitmapText(0, 0, this._mIText.mFont, "NaN", 72, this._mIText.mGroup);
                }
            }
            else {
                this._mText = this.mGame.add.text(0, 0, "NaN", { font: "36px " + this._mIText.mFont }, this._mIText.mGroup);
                this._mText.fill = this._mIWebfont.mFill;
                this._mText.stroke = this._mIWebfont.mStroke;
                this._mText.strokeThickness = this._mIWebfont.mStrokeThickness;
            }
            this._mText.anchor = this._mIText.mAnchor;
        };
        Text.prototype.enable = function () {
            _super.prototype.enable.call(this);
            this._mText.revive();
        };
        Text.prototype.disable = function () {
            _super.prototype.disable.call(this);
            this._mText.kill();
        };
        Object.defineProperty(Text.prototype, "mPosition", {
            set: function (position) {
                if (Helper.exists(this._mText)) {
                    this._mText.position = position;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Text.prototype, "mScale", {
            set: function (scale) {
                if (Helper.exists(this._mText)) {
                    this._mText.scale = scale;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Text.prototype, "mRotation", {
            set: function (rotation) {
                if (Helper.exists(this._mText)) {
                    this._mText.rotation = rotation;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Text.prototype, "mText", {
            get: function () {
                return this._mText;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Text.prototype, "mFontSize", {
            get: function () {
                return Number(this._mText.fontSize);
            },
            set: function (value) {
                this._mText.fontSize = value;
            },
            enumerable: true,
            configurable: true
        });
        Text.prototype.notify = function (message) {
            _super.prototype.notify.call(this, message);
            switch (message) {
                case "PositionChanged":
                    this.mPosition = this._mTransform.mPosition;
                    break;
                case "ScaleChanged":
                    this.mScale = this._mTransform.mScale;
                    break;
                case "RotationChanged":
                    this.mRotation = Phaser.Math.degToRad(this._mTransform.mRotation);
                    break;
                case "ToTop":
                    if (this._mText instanceof Phaser.Text) {
                        //als webfont text is breng naar top
                        this._mText.bringToTop();
                    }
                    else {
                        //als bitmapfont is dan moet het via group
                        if (Helper.exists(this._mIText.mGroup)) {
                            //breng naar top
                            this._mIText.mGroup.bringToTop(this._mText);
                        }
                    }
                    break;
            }
        };
        return Text;
    }(Dlib.Dcomponent));
    Dlib.Text = Text;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Dpause = (function () {
        function Dpause(game) {
            if (Helper.exists(Dpause.mInstance)) {
                throw new Error("Error Dpause already Exists!");
            }
            Dpause.mInstance = this;
            this.mGame = game;
            this._mVisibility = true;
            game.onBlur.add(this.blur, Dpause.mInstance);
            game.onFocus.add(this.focus, Dpause.mInstance);
            this._mGamePaused = false;
            this._mFullPaused = false;
            this.mOnGamePaused = new Phaser.Signal();
            this.mOnGameResume = new Phaser.Signal();
            this.mOnFullPaused = new Phaser.Signal();
            this.mOnFullResume = new Phaser.Signal();
            Dlib.Dscreen.mInstance.eResize.add(this.screenRotated, Dpause.mInstance);
            this.screenRotated();
        }
        Dpause.prototype.blur = function () {
            this._mVisibility = false;
            this.mFullPause = true;
        };
        Dpause.prototype.focus = function () {
            this._mVisibility = true;
            this.mFullPause = false;
        };
        Dpause.prototype.screenRotated = function () {
            if (Dlib.Dscreen.mInstance.correctOrientation()) {
                Dpause.mInstance.mFullPause = false;
            }
            else {
                Dpause.mInstance.mFullPause = true;
            }
        };
        Object.defineProperty(Dpause.prototype, "mGamePaused", {
            get: function () { return this._mGamePaused; },
            set: function (value) {
                //check of het niet de zelfde state is
                if (this._mGamePaused === value) {
                    return;
                }
                //is value true dus we gaan pausen
                if (value) {
                    //zo niet pause en dispatch
                    this._mGamePaused = true;
                    this.mOnGamePaused.dispatch();
                }
                else {
                    //resume en dispatch
                    this._mGamePaused = false;
                    this.mOnGameResume.dispatch();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Dpause.prototype, "mFullPause", {
            get: function () { return this._mFullPaused; },
            set: function (value) {
                //check of het niet de zelfde value is
                if (this._mFullPaused === value) {
                    return;
                }
                //is value true dus we gaan pausen
                if (value) {
                    //zo niet pause en dispatch
                    this._mFullPaused = true;
                    this.mOnFullPaused.dispatch();
                }
                else {
                    if (Dlib.Dscreen.mInstance.correctOrientation() && this._mVisibility) {
                        //resume en dispatch
                        this._mFullPaused = false;
                        this.mOnFullResume.dispatch();
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Dpause.gamePause = function () {
            Dpause.mInstance.mGamePaused = true;
        };
        Dpause.gameResume = function () {
            Dpause.mInstance.mGamePaused = false;
        };
        Dpause.fullPause = function () {
            Dpause.mInstance.mGamePaused = true;
        };
        Dpause.fullResume = function () {
            Dpause.mInstance.mGamePaused = false;
        };
        return Dpause;
    }());
    Dlib.Dpause = Dpause;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Dsave = (function () {
        function Dsave(id) {
            //check of core instance al bestaat
            if (Helper.exists(Dlib.Dlayer.mInstance)) {
                throw new Error("Error double instance of Dsave!");
            }
            //check of save ID bestaat zo niet maak temp aan
            if (Helper.exists(id)) {
                if (id !== "") {
                    this._mID = id;
                }
                else {
                    this._mID = "GobletGamesTemp";
                }
            }
            else {
                this._mID = "GobletGamesTemp";
            }
            //set refference van instance
            Dsave.mInstance = this;
            try {
                var x = 'test-localstorage-' + Date.now();
                localStorage.setItem(x, x);
                var y = localStorage.getItem(x);
                localStorage.removeItem(x);
                if (y !== x) {
                    throw new Error();
                }
                this._mLocalStorageExists = true;
            }
            catch (e) {
                this._mLocalStorageExists = false;
            }
        }
        Dsave.prototype.clear = function () {
            localStorage.removeItem(this._mID);
        };
        Object.defineProperty(Dsave.prototype, "savedString", {
            //#region Save/load String
            get: function () {
                if (!this._mLocalStorageExists) {
                    return null;
                }
                return localStorage.getItem(this._mID);
            },
            set: function (str) {
                if (!this._mLocalStorageExists) {
                    return;
                }
                localStorage.setItem(this._mID, str);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Dsave.prototype, "savedJson", {
            //#endregion
            //#region Save/load JSon
            get: function () {
                if (!this._mLocalStorageExists) {
                    return null;
                }
                return JSON.parse(localStorage.getItem(this._mID));
            },
            set: function (json) {
                if (!this._mLocalStorageExists) {
                    return;
                }
                localStorage.setItem(this._mID, JSON.stringify(json));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Dsave.prototype, "savedNumber", {
            //#endregion
            //#region Save/load Number
            get: function () {
                if (!this._mLocalStorageExists) {
                    return null;
                }
                if (typeof localStorage.getItem(this._mID) === "number") {
                    return localStorage.getItem(this._mID);
                }
                else {
                    return Number(localStorage.getItem(this._mID));
                }
            },
            set: function (nr) {
                if (!this._mLocalStorageExists) {
                    return;
                }
                localStorage.setItem(this._mID, nr.toString());
            },
            enumerable: true,
            configurable: true
        });
        return Dsave;
    }());
    Dlib.Dsave = Dsave;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var Background = (function (_super) {
        __extends(Background, _super);
        function Background(key, sheet) {
            _super.call(this, "Background");
            this._mKey = key;
            if (Helper.exists(sheet)) {
                this._mSheet = sheet;
            }
            this._mCenterPoint = new Phaser.Point();
        }
        Background.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            this.addComponent(new Dlib.Image({
                mKey: this._mKey,
                mGroup: null,
                mAnchor: new Phaser.Point(0.5, 0.5),
                mSheet: this._mSheet
            }));
        };
        Background.prototype.update = function () {
            _super.prototype.update.call(this);
            //center image
            this._mCenterPoint.x = this._mGame.width / 2;
            this._mCenterPoint.y = (this._mGame.height / 2);
            this.mTransform.mPosition = this._mCenterPoint;
        };
        Background.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mCenterPoint = null;
            this._mKey = null;
            this._mSheet = null;
        };
        return Background;
    }(Dlib.Dobject));
    Dlib.Background = Background;
})(Dlib || (Dlib = {}));
var Dlib;
(function (Dlib) {
    var GuiSprite = (function (_super) {
        __extends(GuiSprite, _super);
        function GuiSprite(name, guiTransformInterface, imageInterface) {
            _super.call(this, name);
            this._mIGuiTransformInterface = guiTransformInterface;
            this._mIImageInterface = imageInterface;
            this.mTweenComplete = new Phaser.Signal();
        }
        GuiSprite.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            //maak guitransform
            //maak image
            //maak tween
            this._mGuiTransform = this.addComponent(new Dlib.GuiTransform(this._mIGuiTransformInterface));
            this._mSprite = this.addComponent(new Dlib.Sprite(this._mIImageInterface));
            this._mTween = this.addComponent(new Dlib.Tween(this._mIGuiTransformInterface.mTweenSpeed));
            //set image op correcte positie
            this.mTransform.mScale = this._mGuiTransform.calculateScaleFromSize(new Phaser.Point(this._mSprite.mSprite.width, this._mSprite.mSprite.height));
            this.mTransform.mPosition = this._mGuiTransform.mPosition;
        };
        //todo tween in moet somehow anders zit op image, button en text
        GuiSprite.prototype.tweenIn = function () {
            this.mTransform.mPosition = this._mGuiTransform.calculateOutofScreenPosition(new Phaser.Point(this._mSprite.mSprite.width, this._mSprite.mSprite.height));
            this._mTween.tweenPosition(this._mGuiTransform.mPosition, this.tweenInComplete, this, Phaser.Easing.Back.Out);
        };
        GuiSprite.prototype.tweenInComplete = function () {
            this.mTweenComplete.dispatch();
        };
        GuiSprite.prototype.tweenOut = function (callback, context) {
            this._mTween.tweenPosition(this._mGuiTransform.calculateOutofScreenPosition(new Phaser.Point(this._mSprite.mSprite.width, this._mSprite.mSprite.height)), callback, context, Phaser.Easing.Back.In);
        };
        GuiSprite.prototype.addAnimation = function (animationInterface) {
            this._mSprite.addAnimation(animationInterface);
        };
        GuiSprite.prototype.playAnimation = function (loop) {
            this._mSprite.playAnimation(loop);
        };
        GuiSprite.prototype.stopAnimation = function () {
            this._mSprite.stopAnimation();
        };
        GuiSprite.prototype.setImage = function (imageInterface) {
            this._mSprite.setSprite(imageInterface.mKey, imageInterface.mSheet, imageInterface.mAnchor, imageInterface.mGroup);
            this.mTransform.mScale = new Phaser.Point(1, 1);
            this.mTransform.mScale = this._mGuiTransform.calculateScaleFromSize(new Phaser.Point(this._mSprite.mSprite.width, this._mSprite.mSprite.height));
            this.mTransform.mPosition = this._mGuiTransform.mPosition;
        };
        //cleanup
        GuiSprite.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mGuiTransform = null;
            this._mSprite = null;
            this._mTween = null;
            this._mIGuiTransformInterface = null;
            this._mIImageInterface = null;
            this.mTweenComplete.dispose();
            this.mTweenComplete = null;
        };
        return GuiSprite;
    }(Dlib.Dobject));
    Dlib.GuiSprite = GuiSprite;
})(Dlib || (Dlib = {}));
