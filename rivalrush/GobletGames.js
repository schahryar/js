var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
window.onload = function () {
    var game = new Dlib.Dlib();
    game.state.add("raceBoot", Race.RaceBoot);
    game.state.add("menu", Race.Menu);
    game.state.add("levelSelect", Race.LevelSelect);
    game.state.add("game", Race.Game);
    game.state.start("Boot");
};
var Race;
(function (Race) {
    (function (BEHAVIOR) {
        BEHAVIOR[BEHAVIOR["STATIC"] = 0] = "STATIC";
        BEHAVIOR[BEHAVIOR["BLOCKING"] = 1] = "BLOCKING";
        BEHAVIOR[BEHAVIOR["RANDOMTURN"] = 2] = "RANDOMTURN";
        BEHAVIOR[BEHAVIOR["ZIGZAG"] = 3] = "ZIGZAG";
    })(Race.BEHAVIOR || (Race.BEHAVIOR = {}));
    var BEHAVIOR = Race.BEHAVIOR;
    var AiComponent = (function (_super) {
        __extends(AiComponent, _super);
        function AiComponent(aiInterface) {
            _super.call(this, "AiComponent");
            this.mAiInterface = aiInterface;
            this._mLane = this.mAiInterface.mLane;
            this._mTriggerd = false;
            this._mLaneSwitchAudio = false;
        }
        AiComponent.prototype.create = function () {
            _super.prototype.create.call(this);
            this._mCar = this.mDobject;
            if (this.land()) {
                this._mCar.mTransform.mPosition = new Phaser.Point(this._mCar.mTransform.mPosition.x, this.getLane(this._mLane));
            }
            else {
                this._mCar.mTransform.mPosition = new Phaser.Point(this.getLane(this._mLane), this._mCar.mTransform.mPosition.y);
            }
            this._mPlayer = Dlib.Dcore.mInstance.findObjectByName("Player");
            if (this.mAiInterface.mBehavior === BEHAVIOR.ZIGZAG) {
                if (this.getFurthestLane() === 0) {
                    this._mLeftSide = true;
                }
                else {
                    this._mLeftSide = false;
                }
            }
        };
        AiComponent.prototype.update = function () {
            _super.prototype.update.call(this);
        };
        AiComponent.prototype.changeToLane = function (lane) {
            var lDist = 0;
            if (this.land()) {
                var lDist = this.getLane(lane) - this._mCar.mTransform.mPosition.y;
            }
            else {
                var lDist = this.getLane(lane) - this._mCar.mTransform.mPosition.x;
            }
            var lLeft = false;
            var lRight = false;
            if (lDist < 0) {
                lDist *= -1;
                lLeft = true;
            }
            else {
                lRight = true;
            }
            if (lDist > 5) {
                if (lLeft) {
                    this._mCar.left(this.mAiInterface.mTurnSpeed);
                }
                if (lRight) {
                    this._mCar.right(this.mAiInterface.mTurnSpeed);
                }
                if (this._mLaneSwitchAudio === false) {
                    this._mLaneSwitchAudio = true;
                    Dlib.Daudio.mInstance.playOnceTag("TrafficChangeTrack");
                }
            }
            else {
                if (this.land()) {
                    this._mCar.mTransform.fastSetRotation(90);
                }
                else {
                    this._mCar.mTransform.fastSetRotation(0);
                }
            }
        };
        AiComponent.prototype.setRandomLane = function () {
            var lRndLane = this.mGame.rnd.integerInRange(0, 3);
            while (lRndLane === this._mLane) {
                lRndLane = this.mGame.rnd.integerInRange(0, 3);
            }
            this._mLane = lRndLane;
        };
        AiComponent.prototype.getFurthestLane = function () {
            if (this.getClosestLane(this._mCar.mTransform.mPosition) > 1) {
                return 0;
            }
            else {
                return 3;
            }
        };
        AiComponent.prototype.getLane = function (lane) {
            if (lane > 3) {
                lane = 3;
            }
            switch (lane) {
                case 0:
                    return 158.5;
                case 1:
                    return 251.5;
                case 2:
                    return 345.5;
                case 3:
                    return 438.5;
                default:
            }
            return 171 + (lane * 86);
        };
        AiComponent.prototype.getClosestLane = function (p) {
            var lDist = 0;
            var lLane = 0;
            if (this.land()) {
                lDist = Math.abs(this.getLane(0) - p.y);
                lLane = 0;
                for (var i = 0; i < 4; i++) {
                    var lTempDist = this.getLane(i) - p.y;
                    if (lTempDist < 0) {
                        lTempDist *= -1;
                    }
                    if (lTempDist < lDist) {
                        lLane = i;
                        lDist = lTempDist;
                    }
                }
            }
            else {
                lDist = this.getLane(0) - p.x;
                lLane = 0;
                if (lDist < 0) {
                    lDist *= -1;
                }
                for (var i = 0; i < 4; i++) {
                    var lTempDist = this.getLane(i) - p.x;
                    if (lTempDist < 0) {
                        lTempDist *= -1;
                    }
                    if (lTempDist < lDist) {
                        lLane = i;
                        lDist = lTempDist;
                    }
                }
            }
            return lLane;
        };
        AiComponent.prototype.reverse = function (speed) {
            this._mCar.forward(speed);
        };
        AiComponent.prototype.drive = function (speed) {
            this._mCar.backward(speed);
            switch (this.mAiInterface.mBehavior) {
                case BEHAVIOR.BLOCKING:
                    if (this.isInRange()) {
                        this._mLane = this.getClosestLane(this._mPlayer.mCar.mTransform.mPosition);
                    }
                    else {
                        return;
                    }
                    break;
                case BEHAVIOR.RANDOMTURN:
                    if (this.isInRange()) {
                        if (this._mTriggerd === false) {
                            this._mTriggerd = true;
                            this.setRandomLane();
                        }
                    }
                    else {
                        return;
                    }
                    break;
                case BEHAVIOR.ZIGZAG:
                    if (this.isInRange()) {
                        if (this._mLeftSide) {
                            if (this.getClosestLane(this._mCar.mTransform.mPosition) === 0) {
                                this._mLeftSide = false;
                            }
                            else {
                                this._mLane = 0;
                            }
                        }
                        else {
                            if (this.getClosestLane(this._mCar.mTransform.mPosition) === 3) {
                                this._mLeftSide = true;
                            }
                            else {
                                this._mLane = 3;
                            }
                        }
                    }
                    else {
                        return;
                    }
                    break;
                case BEHAVIOR.STATIC:
                    return;
            }
            this.changeToLane(this._mLane);
        };
        AiComponent.prototype.straightCar = function () {
            if (this.land()) {
                this._mCar.mTransform.mRotation = 90;
            }
            else {
                this._mCar.mTransform.mRotation = 0;
            }
        };
        AiComponent.prototype.isInRange = function () {
            if (this.distanceToPlayer() < this.mAiInterface.mRange) {
                return true;
            }
            return false;
        };
        AiComponent.prototype.distanceToPlayer = function () {
            if (Helper.exists(this._mPlayer)) {
                if (this.land()) {
                    return Math.abs(this._mPlayer.mCar.mTransform.mPosition.x - this._mCar.mTransform.mPosition.x);
                }
                else {
                    return Math.abs(this._mPlayer.mCar.mTransform.mPosition.y - this._mCar.mTransform.mPosition.y);
                }
            }
            return 9999999;
        };
        AiComponent.prototype.land = function () {
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.LANDSCAPE) {
                return true;
            }
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.PORTRAIT) {
                return false;
            }
            return false;
        };
        AiComponent.prototype.reSize = function () {
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.Dscreen.mInstance.mPreviousRotation) {
                return;
            }
            if (this.land()) {
                this._mCar.mTransform.mPosition = new Phaser
                    .Point((this._mCar.mTransform.mPosition.y * -1) + this.mGame.width * 0.75, this._mCar.mTransform.mPosition.x);
                this._mCar.mTransform.mRotation = 90;
            }
            else {
                this._mCar.mTransform.mPosition = new Phaser
                    .Point(this._mCar.mTransform.mPosition.y, (this._mCar.mTransform.mPosition.x * -1) + this.mGame.height * 0.75);
                this._mCar.mTransform.mRotation = 0;
            }
        };
        AiComponent.prototype.destroy = function () {
            this.mAiInterface = null;
            this._mPlayer = null;
            this._mCar = null;
            this._mLane = null;
            this._mTriggerd = null;
            this._mLeftSide = null;
            this._mLaneSwitchAudio = null;
            _super.prototype.destroy.call(this);
        };
        return AiComponent;
    }(Dlib.Dcomponent));
    Race.AiComponent = AiComponent;
})(Race || (Race = {}));
var Race;
(function (Race) {
    var Spawner = (function (_super) {
        __extends(Spawner, _super);
        function Spawner() {
            _super.call(this, "Spawner");
            this.mCars = new Array();
            this.mAi = new Array();
        }
        Spawner.prototype.create = function () {
            _super.prototype.create.call(this);
        };
        Spawner.prototype.spawn = function (json) {
            for (var i = 0; i < json.Cars.length; i++) {
                this.createAiCar({
                    mBehavior: json.Cars[i].Behavior,
                    mLane: json.Cars[i].Lane,
                    mRange: json.Cars[i].AIRange,
                    mTurnSpeed: json.Cars[i].TurnSpeed
                }, json.Cars[i].Type, json.Cars[i].Dist);
            }
            this.createAiCar({
                mBehavior: json.Boss.Behavior,
                mLane: json.Boss.Lane,
                mRange: json.Boss.AIRange,
                mTurnSpeed: json.Boss.TurnSpeed
            }, 0, json.Boss.Dist, json.Boss.SpriteKey);
            this.mBoss = this.mCars[this.mCars.length - 1];
        };
        Spawner.prototype.createAiCar = function (aiInterface, carType, carDistance, bossKey) {
            var lCarSprite = this.getCarSprite(carType, aiInterface.mBehavior);
            if (Helper.exists(bossKey)) {
                lCarSprite = bossKey;
            }
            this.mCars.push(Dlib.Dcore.mInstance.createDobject(new Race.Car({
                mGroup: Dlib.Dlayer.mInstance.getLayer("Cars"),
                mKey: lCarSprite,
                mSheet: "CarSheet0",
                mAnchor: new Phaser.Point(0.5, 0.5)
            })));
            var lCar = this.mCars[this.mCars.length - 1];
            this.mAi.push(lCar.addComponent(new Race.AiComponent(aiInterface)));
            if (this.land()) {
                lCar.mTransform.mPosition = new Phaser.Point(carDistance, lCar.mTransform.mPosition.y);
                lCar.mTransform.mRotation = 90;
            }
            else {
                lCar.mTransform.mPosition = new Phaser.Point(lCar.mTransform.mPosition.x, carDistance * -1);
                lCar.mTransform.mRotation = 0;
            }
        };
        Spawner.prototype.getCarSprite = function (carType, carBehavior) {
            var spriteKey = "";
            var carNumber = 0;
            switch (carType) {
                case 0:
                    spriteKey = "Car";
                    carNumber = this.mGame.rnd.integerInRange(0, 1);
                    break;
                case 1:
                    spriteKey = "PickupTruck";
                    break;
                case 2:
                    spriteKey = "Van";
                    break;
                case 3:
                    spriteKey = "Truck";
                    break;
            }
            switch (carBehavior) {
                case 0:
                    spriteKey += "Yellow" + carNumber;
                    break;
                case 1:
                    spriteKey += "Green0";
                    break;
                case 2:
                    spriteKey += "Blue0";
                    break;
                case 3:
                    spriteKey += "White0";
                    break;
                default:
            }
            if (carType === 4) {
                spriteKey = "BigTruckYellow0";
            }
            return spriteKey;
        };
        Spawner.prototype.deleteAllCars = function () {
            while (this.mCars.length > 0) {
                Dlib.Dcore.mInstance.removeDobject(this.mCars.splice(0, 1)[0]);
            }
            while (this.mAi.length > 0) {
                this.mAi.pop();
            }
        };
        Spawner.prototype.land = function () {
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.LANDSCAPE) {
                return true;
            }
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.PORTRAIT) {
                return false;
            }
            return false;
        };
        Spawner.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.mCars = null;
            this.mAi = null;
        };
        return Spawner;
    }(Dlib.Dcomponent));
    Race.Spawner = Spawner;
})(Race || (Race = {}));
var Race;
(function (Race) {
    var SpriteShakeComponent = (function (_super) {
        __extends(SpriteShakeComponent, _super);
        function SpriteShakeComponent(intensity, delayMS) {
            _super.call(this, "SpriteShakeComponent");
            this._mShake = false;
            this._mOriginalAnchor = new Phaser.Point();
            this._mIntensity = intensity;
            this._mDelayMS = delayMS;
        }
        SpriteShakeComponent.prototype.create = function () {
            _super.prototype.create.call(this);
            this.oldTime = this.mGame.time.time + this._mDelayMS;
        };
        SpriteShakeComponent.prototype.update = function () {
            _super.prototype.update.call(this);
            if (this._mShake) {
                if (Helper.exists(this.mDobject.mTransform.mRenderObject)) {
                    if (this.mGame.time.time >= this.oldTime) {
                        this.oldTime = this.mGame.time.time + this._mDelayMS;
                        this.mDobject.mTransform.mRenderObject.anchor.x = (((this._mIntensity * 2) * this.mGame.rnd.frac()) - this._mIntensity) + this._mOriginalAnchor.x;
                        this.mDobject.mTransform.mRenderObject.anchor.y = (((this._mIntensity * 2) * this.mGame.rnd.frac()) - this._mIntensity) + this._mOriginalAnchor.y;
                    }
                }
            }
        };
        Object.defineProperty(SpriteShakeComponent.prototype, "mShake", {
            get: function () {
                return this._mShake;
            },
            set: function (value) {
                this._mShake = value;
                if (Helper.exists(this.mDobject.mTransform.mRenderObject)) {
                    if (this._mShake) {
                        this.mDobject.mTransform.mRenderObject.anchor.clone(this._mOriginalAnchor);
                    }
                    else {
                        this.mDobject.mTransform.mRenderObject.anchor.copyFrom(this._mOriginalAnchor);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        SpriteShakeComponent.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mShake = null;
            this._mOriginalAnchor = null;
            this._mIntensity = null;
        };
        return SpriteShakeComponent;
    }(Dlib.Dcomponent));
    Race.SpriteShakeComponent = SpriteShakeComponent;
})(Race || (Race = {}));
var Race;
(function (Race) {
    var Car = (function (_super) {
        __extends(Car, _super);
        function Car(iImage) {
            _super.call(this, "Car");
            this._mImageInterface = iImage;
        }
        Car.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            this._mImage = this.addComponent(new Dlib.Image(this._mImageInterface));
        };
        Car.prototype.rectangleLandscape = function () {
            return new Phaser.Rectangle(this.mTransform.mPosition.x - this._mImage.mImage.height * 0.25, this.mTransform.mPosition.y - this._mImage.mImage.width * 0.25, this._mImage.mImage.height * 0.75, this._mImage.mImage.width * 0.75);
        };
        Car.prototype.rectanglePortrait = function () {
            return new Phaser.Rectangle(this.mTransform.mPosition.x - this._mImage.mImage.width * 0.25, this.mTransform.mPosition.y - this._mImage.mImage.height * 0.25, this._mImage.mImage.width * 0.75, this._mImage.mImage.height * 0.75);
        };
        Car.prototype.backward = function (speed) {
            speed = speed * this._mGame.time.physicsElapsed;
            if (this.land()) {
                this.mTransform.fastSetPosition(this.mTransform.mPosition.x - speed, this.mTransform.mPosition.y);
            }
            else {
                this.mTransform.fastSetPosition(this.mTransform.mPosition.x, this.mTransform.mPosition.y + speed);
            }
        };
        Car.prototype.forward = function (speed) {
            speed = speed * this._mGame.time.physicsElapsed;
            if (this.land()) {
                this.mTransform.fastSetPosition(this.mTransform.mPosition.x + speed, this.mTransform.mPosition.y);
            }
            else {
                this.mTransform.fastSetPosition(this.mTransform.mPosition.x, this.mTransform.mPosition.y - speed);
            }
        };
        Car.prototype.left = function (speed) {
            speed = speed * this._mGame.time.physicsElapsed;
            if (this.land()) {
                this.mTransform.fastSetPosition(this.mTransform.mPosition.x, this.mTransform.mPosition.y - speed);
                this.mTransform.fastSetRotation(80);
            }
            else {
                this.mTransform.fastSetPosition(this.mTransform.mPosition.x - speed, this.mTransform.mPosition.y);
                this.mTransform.fastSetRotation(350);
            }
        };
        Car.prototype.right = function (speed) {
            speed = speed * this._mGame.time.physicsElapsed;
            if (this.land()) {
                this.mTransform.fastSetPosition(this.mTransform.mPosition.x, this.mTransform.mPosition.y + speed);
                this.mTransform.fastSetRotation(100);
            }
            else {
                this.mTransform.fastSetPosition(this.mTransform.mPosition.x + speed, this.mTransform.mPosition.y);
                this.mTransform.fastSetRotation(10);
            }
        };
        Object.defineProperty(Car.prototype, "mCarSprite", {
            get: function () {
                return this._mImage.mImage;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Car.prototype, "mRectangle", {
            get: function () {
                if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.LANDSCAPE) {
                    return this.rectangleLandscape();
                }
                if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.PORTRAIT) {
                    return this.rectanglePortrait();
                }
                return this._mRectangle;
            },
            enumerable: true,
            configurable: true
        });
        Car.prototype.land = function () {
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.LANDSCAPE) {
                return true;
            }
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.PORTRAIT) {
                return false;
            }
            return false;
        };
        Car.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mImageInterface = null;
            this._mImage = null;
        };
        return Car;
    }(Dlib.Dobject));
    Race.Car = Car;
})(Race || (Race = {}));
var Race;
(function (Race) {
    var Confettie = (function (_super) {
        __extends(Confettie, _super);
        function Confettie() {
            _super.call(this, "Confettie");
        }
        Confettie.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            var lForce = 700;
            this._mEmitter = this._mGame.add.emitter(0, 0, 60);
            this._mEmitter.group = Dlib.Dlayer.mInstance.getLayer("TotalTop");
            this._mEmitter.makeParticles("ConfettiSheet0", [0, 1, 2, 3, 4, 5, 6, 7]);
            this._mEmitter.minParticleSpeed.setTo(lForce * -1, lForce * -1);
            this._mEmitter.maxParticleSpeed.setTo(lForce, lForce);
            this._mEmitter.setAlpha(1, 0, 4000, Phaser.Easing.Bounce.In);
            this._mEmitter.setScale(0.5, 1, 0.5, 1);
            this._mEmitter.gravity = 1500;
            this._mTimer = this.addComponent(new Dlib.Timer());
            this._mExplodePosition = new Phaser.Point();
        };
        Confettie.prototype.randomPoint = function () {
            this._mExplodePosition.set(100 + Math.random() * 400, 100 + Math.random() * 300);
        };
        Confettie.prototype.explode = function () {
            this.randomPoint();
            this._mEmitter.position = this._mExplodePosition;
            this._mEmitter.explode(1500, 30);
            Dlib.Daudio.mInstance.playOnceTag("ConfettieExplosion");
        };
        Confettie.prototype.start = function () {
            this._mTimer.addRepeatingEvent(1500, this.explode, this);
            this._mTimer.start();
            this.explode();
        };
        Confettie.prototype.stop = function () {
            this._mEmitter.on = false;
            this._mTimer.stop();
        };
        Confettie.prototype.destroy = function () {
            this.stop();
            this._mEmitter.destroy();
            this._mEmitter = null;
            this._mExplodePosition = null;
            this._mTimer = null;
        };
        return Confettie;
    }(Dlib.Dobject));
    Race.Confettie = Confettie;
})(Race || (Race = {}));
var Race;
(function (Race) {
    var Explosion = (function (_super) {
        __extends(Explosion, _super);
        function Explosion(position) {
            _super.call(this, "Explosion");
            this._mPosition = position;
        }
        Explosion.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            this._mSprite = this.addComponent(new Dlib.Sprite({
                mKey: "explosion0000",
                mSheet: "RaceExplosionSheet0",
                mAnchor: new Phaser.Point(0.5, 0.5),
                mGroup: Dlib.Dlayer.mInstance.getLayer("Particles")
            }));
            this.mTransform.mPosition = this._mPosition;
            this._mSprite.addAnimation({
                mAllFrames: true,
                mCallback: this.selfDestroy,
                mContext: this,
                mFps: null,
                mPrefix: null,
                mStart: null,
                mStop: null,
                mSuffix: null,
                mZeroPad: null
            });
            this._mSprite.playAnimation(false, 40);
        };
        Explosion.prototype.selfDestroy = function () {
            Dlib.Dcore.mInstance.removeDobject(this);
        };
        Explosion.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mSprite = null;
            this._mPosition = null;
        };
        return Explosion;
    }(Dlib.Dobject));
    Race.Explosion = Explosion;
})(Race || (Race = {}));
var Race;
(function (Race) {
    (function (LEVELSTATE) {
        LEVELSTATE[LEVELSTATE["INTRO"] = 0] = "INTRO";
        LEVELSTATE[LEVELSTATE["PLAYING"] = 1] = "PLAYING";
        LEVELSTATE[LEVELSTATE["DYING"] = 2] = "DYING";
        LEVELSTATE[LEVELSTATE["RESPAWNING"] = 3] = "RESPAWNING";
        LEVELSTATE[LEVELSTATE["GAMEOVER"] = 4] = "GAMEOVER";
        LEVELSTATE[LEVELSTATE["VICTORY"] = 5] = "VICTORY";
        LEVELSTATE[LEVELSTATE["PAUSE"] = 6] = "PAUSE";
    })(Race.LEVELSTATE || (Race.LEVELSTATE = {}));
    var LEVELSTATE = Race.LEVELSTATE;
    var Level = (function (_super) {
        __extends(Level, _super);
        function Level(json) {
            _super.call(this, "Level");
            this._mLevelJson = json;
            this.mGameOver = new Phaser.Signal();
            this.mVictory = new Phaser.Signal();
        }
        Level.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            this._mScrollingBackground = Dlib.Dcore.mInstance.createDobject(new Race.ScrollingBackground(this._mLevelJson.Theme));
            this._mPlayer = Dlib.Dcore.mInstance.createDobject(new Race.Player(400, 3));
            this._mSpawner = this.addComponent(new Race.Spawner());
            this._mPlayerImmumeTimer = this.addComponent(new Dlib.Timer());
            this._mDistanceIcon = Dlib.Dcore.mInstance.createDobject(new Dlib.Dobject("BossIcon"));
            this._mDistanceIcon.addComponent(new Dlib.Image({ mKey: "ProgressCar0", mSheet: "Sheet0", mAnchor: new Phaser.Point(0.5, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("TotalTop") }));
            this.hideDistanceIcon();
            this.reset();
        };
        Level.prototype.update = function () {
            _super.prototype.update.call(this);
            this.drawBossDistance();
            switch (this._mState) {
                case LEVELSTATE.INTRO:
                    this._mScrollingBackground.scroll(1500);
                    if (this._mPlayer.driveIn(400) === false) {
                        this._mState = LEVELSTATE.PLAYING;
                        this.initDistanceToBoss();
                    }
                    break;
                case LEVELSTATE.PLAYING:
                    this._mScrollingBackground.scroll(1500);
                    this.driveAI(this._mLevelJson.CarSpeed);
                    this._mPlayer.input(true);
                    this._mPlayer.correctPosition(600);
                    if (this.isPlayerOverlappingCars()) {
                        this._mGame.camera.flash(0xffffff, 100);
                        this._mGame.camera.shake(0.01);
                        this.removeHearthNumber(this._mPlayer.mHealth);
                        this._mPlayer.mHealth--;
                        if (this._mPlayer.mHealth <= 0) {
                            Dlib.Daudio.mInstance.playOnceTag("CarExplode");
                            this._mState = LEVELSTATE.GAMEOVER;
                            Dlib.Dcore.mInstance.createDobject(new Race.Explosion(this._mPlayer.mCar.mTransform.mPosition));
                            this._mPlayer.outOffScreen();
                            this.straightCar();
                            this.mGameOver.dispatch();
                        }
                        else {
                            Dlib.Daudio.mInstance.playOnceTag("CarBump");
                            this._mState = LEVELSTATE.DYING;
                            this.straightCar();
                        }
                    }
                    if (this.land()) {
                        if (this._mSpawner.mBoss.mTransform.mPosition.x - this._mPlayer.mCar.mTransform.mPosition.x < 50) {
                            Dlib.Daudio.mInstance.playOnceTag("CarVictoryPass");
                            this._mState = LEVELSTATE.VICTORY;
                        }
                    }
                    else {
                        if (this._mSpawner.mBoss.mTransform.mPosition.y - this._mPlayer.mCar.mTransform.mPosition.y > 50) {
                            Dlib.Daudio.mInstance.playOnceTag("CarVictoryPass");
                            this._mState = LEVELSTATE.VICTORY;
                        }
                    }
                    break;
                case LEVELSTATE.DYING:
                    this._mScrollingBackground.scroll(750);
                    this.reverseAI(this._mLevelJson.CarSpeed / 2);
                    this._mPlayer.mCar.mTransform.mRotation += 360 * this._mGame.time.physicsElapsed;
                    if (this._mPlayer.driveOut(400) === false) {
                        this._mState = LEVELSTATE.RESPAWNING;
                        this._mPlayer.mCar.mTransform.mRotation = 0;
                        this._mPlayer.outOffScreen();
                    }
                    break;
                case LEVELSTATE.RESPAWNING:
                    this._mScrollingBackground.scroll(1500);
                    this._mPlayer.input(true);
                    this._mPlayer.mCar.mCarSprite.alpha = 0.5;
                    if (this._mPlayer.driveIn(200) === false) {
                        if (this._mPlayerImmumeTimer.mStarted === false) {
                            this._mPlayerImmumeTimer.reset();
                            this._mPlayerImmumeTimer.addEvent(1000, this.playerCarEnable, this);
                            this._mPlayerImmumeTimer.start();
                            Dlib.Daudio.mInstance.playOnceTag("TimerTickRespawnGo");
                        }
                        else {
                            this.driveAI(this._mLevelJson.CarSpeed);
                        }
                    }
                    break;
                case LEVELSTATE.GAMEOVER:
                    this._mScrollingBackground.scroll(0);
                    this.reverseAI(this._mLevelJson.CarSpeed * 2);
                    break;
                case LEVELSTATE.VICTORY:
                    this._mScrollingBackground.scroll(1500);
                    this.driveAI(this._mLevelJson.CarSpeed);
                    if (this._mPlayer.driveVictory(800) === false) {
                        this._mState = LEVELSTATE.PAUSE;
                        this.mVictory.dispatch();
                    }
                    break;
                case LEVELSTATE.PAUSE:
                    break;
            }
        };
        Level.prototype.removeHearthNumber = function (nr) {
            var lHartjes = this.getHearths();
            if (!Helper.exists(lHartjes)) {
                return;
            }
            lHartjes[nr - 1].playAnimation(false);
        };
        Level.prototype.fixHearths = function () {
            for (var i = 0; i < 3 - this._mPlayer.mHealth; i++) {
                this.removeHearthNumber(3 - i);
            }
        };
        Level.prototype.getHearths = function () {
            var lHartjes = [];
            for (var i = 0; i < 3; i++) {
                var lHartje = Dlib.Dcore.mInstance.findObjectByName("LifeHeart" + i.toString());
                if (Helper.exists(lHartje)) {
                    lHartjes.push(lHartje);
                }
                else {
                    return null;
                }
            }
            return lHartjes;
        };
        Level.prototype.initDistanceToBoss = function () {
            this._mBeginDistanceToBoss = this._mPlayer.distanceTo(this._mSpawner.mBoss.mTransform);
        };
        Level.prototype.percentageToBoss = function () {
            var difference = this._mBeginDistanceToBoss - this._mPlayer.distanceTo(this._mSpawner.mBoss.mTransform);
            var percentage = (difference / (this._mBeginDistanceToBoss / 100)) / 100;
            if (percentage > this._mDistanceToBoss) {
                this._mDistanceToBoss = percentage;
            }
            return this._mDistanceToBoss;
        };
        Level.prototype.drawBossDistance = function () {
            var lProgressLine = Dlib.Dcore.mInstance.findObjectByName("ProgressLine");
            if (Helper.exists(lProgressLine)) {
                var lPercent = this.percentageToBoss();
                var lDist = lProgressLine.getComponent(Dlib.Image).mImage.bottom - lProgressLine.getComponent(Dlib.Image).mImage.height * lPercent;
                this._mDistanceIcon.mTransform.mPosition = new Phaser.Point(lProgressLine.mTransform.mPosition.x, lDist);
            }
            else {
                this.hideDistanceIcon();
            }
        };
        Level.prototype.hideDistanceIcon = function () {
            if (Helper.exists(this._mDistanceIcon)) {
                this._mDistanceIcon.mTransform.mPosition = new Phaser.Point(10000, 10000);
            }
        };
        Level.prototype.straightCar = function () {
            for (var i = 0; i < this._mSpawner.mAi.length; i++) {
                this._mSpawner.mAi[i].straightCar();
            }
        };
        Level.prototype.playerCarEnable = function () {
            this._mPlayerImmumeTimer.stop();
            this._mState = LEVELSTATE.PLAYING;
            this._mPlayer.mCar.mCarSprite.alpha = 1;
        };
        Level.prototype.driveAI = function (speed) {
            for (var i = 0; i < this._mSpawner.mAi.length; i++) {
                this._mSpawner.mAi[i].drive(speed);
            }
        };
        Level.prototype.reverseAI = function (speed) {
            for (var i = 0; i < this._mSpawner.mAi.length; i++) {
                this._mSpawner.mAi[i].reverse(speed);
            }
        };
        Level.prototype.isPlayerOverlappingCars = function () {
            for (var i = 0; i < this._mSpawner.mCars.length; i++) {
                var lDist = Math.abs(this._mPlayer.mCar.mTransform.mPosition.y - this._mSpawner.mCars[i].mTransform.mPosition.y);
                if (lDist < 100) {
                    if (Phaser.Rectangle.intersects(this._mPlayer.mCar.mRectangle, this._mSpawner.mCars[i].mRectangle)) {
                        return true;
                    }
                }
            }
            return false;
        };
        Level.prototype.start = function () {
            this._mState = LEVELSTATE.INTRO;
            Dlib.Daudio.mInstance.setMusic("RaceGameplayMusic", true);
            Dlib.Daudio.mInstance.startMusic(true);
            Dlib.Daudio.mInstance.playOnceTag("CarRev");
        };
        Level.prototype.pause = function () {
            this._mPreviousState = this._mState;
            this._mState = LEVELSTATE.PAUSE;
            if (this._mPlayerImmumeTimer.mStarted) {
                this._mPlayerImmumeTimer.mPaused = true;
            }
            this._mPlayer.stopSparks();
        };
        Level.prototype.resume = function () {
            this._mState = this._mPreviousState;
            if (this._mPlayerImmumeTimer.mStarted) {
                this._mPlayerImmumeTimer.mPaused = false;
            }
            this._mPlayer.resumeSparks();
        };
        Level.prototype.reset = function () {
            this._mState = LEVELSTATE.PAUSE;
            this._mSpawner.deleteAllCars();
            this._mSpawner.spawn(this._mLevelJson);
            this._mPlayer.outOffScreen();
            this._mPlayer.reset();
            this._mPlayerImmumeTimer.reset();
            this._mDistanceToBoss = 0;
            this._mPlayer.mCar.mCarSprite.alpha = 1;
        };
        Level.prototype.clear = function () {
            this._mState = LEVELSTATE.PAUSE;
            this._mSpawner.deleteAllCars();
            this._mScrollingBackground.clearRoad();
            this._mPlayer.clear();
            Dlib.Dcore.mInstance.removeDobject(this._mPlayer);
        };
        Level.prototype.stars = function () {
            return this._mPlayer.mHealth;
        };
        Level.prototype.reSize = function () {
            this._mScrollingBackground.reSize();
            for (var i = 0; i < this._mSpawner.mAi.length; i++) {
                this._mSpawner.mAi[i].reSize();
            }
            this._mPlayer.reSize();
        };
        Level.prototype.land = function () {
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.LANDSCAPE) {
                return true;
            }
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.PORTRAIT) {
                return false;
            }
            return false;
        };
        Level.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mDistance = null;
            this._mPlayer = null;
            this._mSpawner = null;
            this._mScrollingBackground = null;
            this._mState = null;
            this._mPreviousState = null;
            this._mLevelJson = null;
            this._mPlayerImmumeTimer = null;
        };
        return Level;
    }(Dlib.Dobject));
    Race.Level = Level;
})(Race || (Race = {}));
var Race;
(function (Race) {
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(speed, health) {
            _super.call(this, "Player");
            this._mSpeed = speed;
            this.mHealth = health;
            this._mStartHealth = health;
        }
        Player.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            this._mLeftKey = this._mGame.input.keyboard.addKey(Phaser.KeyCode.LEFT);
            this._mRightKey = this._mGame.input.keyboard.addKey(Phaser.KeyCode.RIGHT);
            this._mA = this._mGame.input.keyboard.addKey(Phaser.KeyCode.A);
            this._mD = this._mGame.input.keyboard.addKey(Phaser.KeyCode.D);
            this._mW = this._mGame.input.keyboard.addKey(Phaser.KeyCode.W);
            this._mS = this._mGame.input.keyboard.addKey(Phaser.KeyCode.S);
            this._mUpKey = this._mGame.input.keyboard.addKey(Phaser.KeyCode.UP);
            this._mDownKey = this._mGame.input.keyboard.addKey(Phaser.KeyCode.DOWN);
            this._mCar = Dlib.Dcore.mInstance.createDobject(new Race.Car({
                mGroup: Dlib.Dlayer.mInstance.getLayer("PlayerCar"),
                mKey: "PlayerCar0",
                mSheet: "CarSheet0",
                mAnchor: new Phaser.Point(0.5, 0.5)
            }));
            if (this.land()) {
                this.mCar.mTransform.mPosition = new Phaser.Point(this._mGame.width * 0.25, (this._mGame.height / 2));
                this.mCar.mTransform.mRotation = 90;
            }
            else {
                this.mCar.mTransform.mPosition = new Phaser.Point(this._mGame.width / 2, (this._mGame.height / 4) * 3);
                this.mCar.mTransform.mRotation = 0;
            }
            this._mTimer = this.addComponent(new Dlib.Timer());
            this._mSparks = Dlib.Dcore.mInstance.createDobject(new Race.SparksParticle());
        };
        Player.prototype.outOffScreen = function () {
            if (this.land()) {
                this.mCar.mTransform.mPosition = new Phaser.Point(0 - this._mGame.width / 2, this._mGame.height / 2);
                this.mCar.mTransform.mRotation = 90;
            }
            else {
                this.mCar.mTransform.mPosition = new Phaser.Point(this._mGame.width / 2, this._mGame.height + (this._mGame.height / 2));
                this.mCar.mTransform.mRotation = 0;
            }
            this._mSparks.stop();
        };
        Player.prototype.driveIn = function (speed) {
            this._mSparks.stop();
            this.mCar.forward(speed);
            var lDist = 0;
            if (this.land()) {
                this.mCar.mTransform.mRotation = 90;
                lDist = Math.abs(Math.floor((this._mGame.width * 0.25) - (this.mCar.mTransform.mPosition.x)));
                if (lDist < 7) {
                    this.mCar.mTransform.mPosition = new Phaser.Point((this._mGame.width * 0.25), this.mCar.mTransform.mPosition.y);
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                this.mCar.mTransform.mRotation = 0;
                lDist = Math.abs(Math.floor((this._mGame.height * 0.75) - (this.mCar.mTransform.mPosition.y)));
                if (lDist < 7) {
                    this.mCar.mTransform.mPosition = new Phaser.Point(this.mCar.mTransform.mPosition.x, (this._mGame.height * 0.75));
                    return false;
                }
                else {
                    return true;
                }
            }
        };
        Player.prototype.driveOut = function (speed) {
            this._mSparks.stop();
            this.mCar.backward(speed);
            var lDist = 0;
            if (this.land()) {
                lDist = (0 - (this._mGame.width / 2)) - (this.mCar.mTransform.mPosition.x);
                if (Math.abs(Math.floor(lDist)) < 10) {
                    this.mCar.mTransform.mPosition = new Phaser.Point((0 - (this._mGame.width / 2)), this.mCar.mTransform.mPosition.y);
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                lDist = this._mGame.height + (this._mGame.height / 2) - (this.mCar.mTransform.mPosition.y);
                if (Math.abs(Math.floor(lDist)) < 10) {
                    this.mCar.mTransform.mPosition = new Phaser.Point(this.mCar.mTransform.mPosition.x, this._mGame.height + (this._mGame.height / 2));
                    return false;
                }
                else {
                    return true;
                }
            }
        };
        Player.prototype.correctPosition = function (speed) {
            var lDist = 0;
            if (this.land()) {
                lDist = (this._mGame.width * 0.25) - (this.mCar.mTransform.mPosition.x);
                if (Math.abs(Math.floor(lDist)) < 7) {
                    this.mCar.mTransform.mPosition = new Phaser.Point((this._mGame.width * 0.25), this.mCar.mTransform.mPosition.y);
                }
                else {
                    if (lDist > 0) {
                        this.mCar.forward(speed);
                    }
                    else {
                        this.mCar.backward(speed);
                    }
                }
            }
            else {
                lDist = (this._mGame.height * 0.75) - (this.mCar.mTransform.mPosition.y);
                if (Math.abs(Math.floor(lDist)) < 7) {
                    this.mCar.mTransform.mPosition = new Phaser.Point(this.mCar.mTransform.mPosition.x, (this._mGame.height * 0.75));
                }
                else {
                    if (lDist < 0) {
                        this.mCar.forward(speed);
                    }
                    else {
                        this.mCar.backward(speed);
                    }
                }
            }
        };
        Player.prototype.driveVictory = function (speed) {
            this._mSparks.stop();
            this.mCar.forward(speed);
            var lDist = 0;
            if (this.land()) {
                this._mCar.mTransform.mRotation = 90;
                lDist = (this._mGame.width + (this._mGame.width / 2)) - (this.mCar.mTransform.mPosition.x);
                if (Math.abs(Math.floor(lDist)) < 20) {
                    this.mCar.mTransform.mPosition = new Phaser.Point((this._mGame.width + (this._mGame.width / 2)), this.mCar.mTransform.mPosition.x);
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                this._mCar.mTransform.mRotation = 0;
                lDist = (0 - (this._mGame.height / 2)) - (this.mCar.mTransform.mPosition.y);
                if (Math.abs(Math.floor(lDist)) < 20) {
                    this.mCar.mTransform.mPosition = new Phaser.Point(this.mCar.mTransform.mPosition.x, 0 - (this._mGame.height / 2));
                    return false;
                }
                else {
                    return true;
                }
            }
        };
        Player.prototype.input = function (stayInBounds) {
            if (Dlib.Dcore.mInstance.findObjectByName("GuiView").overlapGui()) {
                console.log("OverGui!");
                return;
            }
            var lLeft = false;
            var lRight = false;
            if (this.land()) {
                this.mCar.mTransform.mRotation = 90;
            }
            else {
                this._mCar.mTransform.mRotation = 0;
            }
            if (this._mLeftKey.isDown || this._mA.isDown || this._mW.isDown || this._mUpKey.isDown) {
                lLeft = true;
            }
            if (this._mRightKey.isDown || this._mD.isDown || this._mS.isDown || this._mDownKey.isDown) {
                lRight = true;
            }
            if (this._mGame.input.activePointer.isDown) {
                if (this.land()) {
                    if (this._mGame.input.activePointer.y < this._mGame.height * 0.5) {
                        lLeft = true;
                    }
                    else {
                        lRight = true;
                    }
                }
                else {
                    if (this._mGame.input.activePointer.x < this._mGame.width * 0.5) {
                        lLeft = true;
                    }
                    else {
                        lRight = true;
                    }
                }
            }
            if (lLeft && lRight) {
                return;
            }
            if (lLeft) {
                var lTurn = 0;
                if (this.land()) {
                    lTurn = this._mCar.mTransform.mPosition.y - this._mSpeed * this._mGame.time.physicsElapsed;
                    if (stayInBounds) {
                        if (this._mCar.mTransform.mPosition.y < 140) {
                            this._mSparks.startLeft(new Phaser.Point(this._mCar.mTransform.mPosition.x, this._mCar.mTransform.mPosition.y - this._mCar.mCarSprite.width * 0.5));
                            return;
                        }
                        else {
                            this._mSparks.stop();
                        }
                    }
                    this._mCar.left(this._mSpeed);
                }
                else {
                    lTurn = this._mCar.mTransform.mPosition.x - this._mSpeed * this._mGame.time.physicsElapsed;
                    if (stayInBounds) {
                        if (this._mCar.mTransform.mPosition.x < 140) {
                            this._mSparks.startLeft(new Phaser.Point(this._mCar.mTransform.mPosition.x - this._mCar.mCarSprite.width * 0.5, this._mCar.mTransform.mPosition.y));
                            return;
                        }
                        else {
                            this._mSparks.stop();
                        }
                    }
                    this._mCar.left(this._mSpeed);
                }
            }
            if (lRight) {
                var lTurn = 0;
                if (this.land()) {
                    lTurn = this._mCar.mTransform.mPosition.y + this._mSpeed * this._mGame.time.physicsElapsed;
                    if (stayInBounds) {
                        if (this._mCar.mTransform.mPosition.y > 470) {
                            this._mSparks.startRight(new Phaser.Point(this._mCar.mTransform.mPosition.x, this._mCar.mTransform.mPosition.y + this._mCar.mCarSprite.width * 0.5));
                            return;
                        }
                        else {
                            this._mSparks.stop();
                        }
                    }
                    this._mCar.right(this._mSpeed);
                }
                else {
                    lTurn = this._mCar.mTransform.mPosition.x + this._mSpeed * this._mGame.time.physicsElapsed;
                    if (stayInBounds) {
                        if (this._mCar.mTransform.mPosition.x > 470) {
                            this._mSparks.startRight(new Phaser.Point(this._mCar.mTransform.mPosition.x + this._mCar.mCarSprite.width * 0.5, this._mCar.mTransform.mPosition.y));
                            return;
                        }
                        else {
                            this._mSparks.stop();
                        }
                    }
                    this._mCar.right(this._mSpeed);
                }
            }
        };
        Player.prototype.reset = function () {
            this.mHealth = this._mStartHealth;
            this._mTimer.reset();
            this._mCar.mTransform.mRotation = 0;
        };
        Player.prototype.distanceTo = function (transform) {
            var lDist = 0;
            if (this.land()) {
                lDist = Math.abs(this._mCar.mTransform.mPosition.x - transform.mPosition.x);
            }
            else {
                lDist = Math.abs(this._mCar.mTransform.mPosition.y - transform.mPosition.y);
            }
            return lDist;
        };
        Object.defineProperty(Player.prototype, "mCar", {
            get: function () {
                return this._mCar;
            },
            enumerable: true,
            configurable: true
        });
        Player.prototype.clear = function () {
            Dlib.Dcore.mInstance.removeDobject(this._mCar);
        };
        Player.prototype.stopSparks = function () {
            this._mSparks.stop();
        };
        Player.prototype.resumeSparks = function () {
            if (this.land()) {
                if (this._mCar.mTransform.mPosition.y < 140) {
                    this._mSparks.startLeft(new Phaser.Point(this._mCar.mTransform.mPosition.x, this._mCar.mTransform.mPosition.y - this._mCar.mCarSprite.width * 0.5));
                    return;
                }
                else {
                    this._mSparks.stop();
                }
                if (this._mCar.mTransform.mPosition.y > 470) {
                    this._mSparks.startRight(new Phaser.Point(this._mCar.mTransform.mPosition.x, this._mCar.mTransform.mPosition.y + this._mCar.mCarSprite.width * 0.5));
                    return;
                }
                else {
                    this._mSparks.stop();
                }
            }
            else {
                if (this._mCar.mTransform.mPosition.x < 140) {
                    this._mSparks.startLeft(new Phaser.Point(this._mCar.mTransform.mPosition.x - this._mCar.mCarSprite.width * 0.5, this._mCar.mTransform.mPosition.y));
                    return;
                }
                else {
                    this._mSparks.stop();
                }
                if (this._mCar.mTransform.mPosition.x > 470) {
                    this._mSparks.startRight(new Phaser.Point(this._mCar.mTransform.mPosition.x + this._mCar.mCarSprite.width * 0.5, this._mCar.mTransform.mPosition.y));
                    return;
                }
                else {
                    this._mSparks.stop();
                }
            }
        };
        Player.prototype.land = function () {
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.LANDSCAPE) {
                return true;
            }
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.PORTRAIT) {
                return false;
            }
            return false;
        };
        Player.prototype.reSize = function () {
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.Dscreen.mInstance.mPreviousRotation) {
                return;
            }
            if (this.land()) {
                this._mCar.mTransform.mPosition = new Phaser
                    .Point(this._mGame.width * 0.25, this._mCar.mTransform.mPosition.x);
                this._mCar.mTransform.mRotation = 90;
            }
            else {
                this._mCar.mTransform.mPosition = new Phaser
                    .Point(this._mCar.mTransform.mPosition.y, this._mGame.height * 0.75);
                this._mCar.mTransform.mRotation = 0;
            }
        };
        Player.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.mHealth = null;
            this._mCar = null;
            this._mTimer = null;
            this._mLeftKey = null;
            this._mRightKey = null;
            this._mA = null;
            this._mD = null;
            this._mSpeed = null;
            this._mSparks = null;
        };
        return Player;
    }(Dlib.Dobject));
    Race.Player = Player;
})(Race || (Race = {}));
var Race;
(function (Race) {
    (function (PROFILELEVEL) {
        PROFILELEVEL[PROFILELEVEL["LOCKED"] = 0] = "LOCKED";
        PROFILELEVEL[PROFILELEVEL["UNLOCKED"] = 1] = "UNLOCKED";
        PROFILELEVEL[PROFILELEVEL["COMPLTED"] = 2] = "COMPLTED";
    })(Race.PROFILELEVEL || (Race.PROFILELEVEL = {}));
    var PROFILELEVEL = Race.PROFILELEVEL;
    var RaceProfile = (function (_super) {
        __extends(RaceProfile, _super);
        function RaceProfile() {
            _super.call(this, "RaceProfile");
            this._mLevels = new Array();
        }
        RaceProfile.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
        };
        RaceProfile.prototype.newProfile = function () {
            this.generateLevels(18);
            this.unlockLevel(0);
            this.saveProfile();
            this.mActivePage = 0;
        };
        RaceProfile.prototype.generateLevels = function (levels) {
            for (var i = 0; i < levels; i++) {
                var lLevel = {};
                lLevel.LevelNumber = i;
                lLevel.Stars = 0;
                lLevel.State = PROFILELEVEL.LOCKED;
                this._mLevels.push(lLevel);
            }
        };
        RaceProfile.prototype.getLevel = function (level) {
            if (level < this._mLevels.length) {
                return this._mLevels[level];
            }
            else {
                return null;
            }
        };
        RaceProfile.prototype.unlockLevel = function (level) {
            if (level < this._mLevels.length) {
                if (this._mLevels[level].State === PROFILELEVEL.LOCKED) {
                    this._mLevels[level].State = PROFILELEVEL.UNLOCKED;
                }
            }
        };
        RaceProfile.prototype.completeLevel = function (level, stars) {
            if (level < this._mLevels.length) {
                this._mLevels[level].State = PROFILELEVEL.COMPLTED;
                if (stars > this._mLevels[level].Stars) {
                    this._mLevels[level].Stars = stars;
                }
                this.unlockLevel(level + 1);
            }
        };
        RaceProfile.prototype.saveProfile = function () {
            Dlib.Dsave.mInstance.savedJson = this.exportProfile();
        };
        RaceProfile.prototype.loadProfile = function () {
            if (Helper.exists(Dlib.Dsave.mInstance.savedJson)) {
                if (this.importProfile(Dlib.Dsave.mInstance.savedJson)) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        };
        RaceProfile.prototype.exportProfile = function () {
            var lProfile = {};
            lProfile.data = this._mLevels;
            lProfile.page = this.mActivePage;
            return lProfile;
        };
        RaceProfile.prototype.importProfile = function (profileObject) {
            if (profileObject.hasOwnProperty("data")) {
                this._mLevels = profileObject.data;
                this.mActivePage = profileObject.page;
                return true;
            }
            else {
                console.log("Error no profile data!");
                return false;
            }
        };
        return RaceProfile;
    }(Dlib.Dobject));
    Race.RaceProfile = RaceProfile;
})(Race || (Race = {}));
var Race;
(function (Race) {
    var ScrollingBackground = (function (_super) {
        __extends(ScrollingBackground, _super);
        function ScrollingBackground(theme) {
            _super.call(this, "ScrollingBackground");
            this._mScrollPoint = new Phaser.Point(0, 0);
            this._mRoadSize = new Phaser.Point(0, 0);
            this._mTheme = theme;
        }
        ScrollingBackground.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            this._mRows = new Array();
            var lSheet = "";
            switch (this._mTheme) {
                case "Grass":
                    lSheet = "RoadSheet0";
                    break;
                case "City":
                    lSheet = "RoadSheet0";
                    break;
                case "Desert":
                    lSheet = "RoadSheet0";
                    break;
                case "Race":
                    lSheet = "RoadSheet0";
                    break;
                default:
                    lSheet = "RoadSheet1";
            }
            for (var i = 0; i < 4; i++) {
                var modulo = (i % 2).toString();
                var left = Dlib.Dcore.mInstance.createDobject(new Dlib.Dobject("RoadLeft" + i.toString()));
                left.addComponent(new Dlib.Image({ mKey: this._mTheme + "RoadLeft" + modulo, mSheet: lSheet, mAnchor: new Phaser.Point(1, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("SideRoad") }));
                var center = Dlib.Dcore.mInstance.createDobject(new Dlib.Dobject("RoadCenter" + i.toString()));
                center.addComponent(new Dlib.Image({ mKey: "Road0", mSheet: null, mAnchor: new Phaser.Point(0.5, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("Road") }));
                this._mRoadSize.x = center.getComponent(Dlib.Image).mImage.width;
                this._mRoadSize.y = center.getComponent(Dlib.Image).mImage.height;
                var right = Dlib.Dcore.mInstance.createDobject(new Dlib.Dobject("RoadRight" + i.toString()));
                right.addComponent(new Dlib.Image({ mKey: this._mTheme + "RoadRight" + modulo, mSheet: lSheet, mAnchor: new Phaser.Point(0, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("SideRoad") }));
                this._mRows.push([left, center, right]);
            }
            this.align();
        };
        ScrollingBackground.prototype.align = function () {
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.LANDSCAPE) {
                this.alignLandscape();
                return;
            }
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.PORTRAIT) {
                this.alignPortrait();
                return;
            }
        };
        ScrollingBackground.prototype.alignPortrait = function () {
            var lOriginPoint = new Phaser.Point(this._mGame.width / 2, this._mGame.height);
            for (var i = 0; i < this._mRows.length; i++) {
                var y = lOriginPoint.y - (this._mRoadSize.y * i);
                this._mRows[i][0].mTransform.mRotation = 0;
                this._mRows[i][1].mTransform.mRotation = 0;
                this._mRows[i][2].mTransform.mRotation = 0;
                this._mRows[i][0].mTransform.mPosition = new Phaser.Point(lOriginPoint.x - (this._mRoadSize.x / 2), y);
                this._mRows[i][1].mTransform.mPosition = new Phaser.Point(lOriginPoint.x, y);
                this._mRows[i][2].mTransform.mPosition = new Phaser.Point(lOriginPoint.x + (this._mRoadSize.x / 2), y);
            }
        };
        ScrollingBackground.prototype.alignLandscape = function () {
            var lOriginPoint = new Phaser.Point(0, this._mGame.height / 2);
            for (var i = 0; i < this._mRows.length; i++) {
                var x = lOriginPoint.x + (this._mRoadSize.y * i);
                this._mRows[i][0].mTransform.mRotation = 90;
                this._mRows[i][1].mTransform.mRotation = 90;
                this._mRows[i][2].mTransform.mRotation = 90;
                this._mRows[i][0].mTransform.mPosition = new Phaser.Point(x, lOriginPoint.y - (this._mRoadSize.x / 2));
                this._mRows[i][1].mTransform.mPosition = new Phaser.Point(x, lOriginPoint.y);
                this._mRows[i][2].mTransform.mPosition = new Phaser.Point(x, lOriginPoint.y + (this._mRoadSize.x / 2));
            }
        };
        ScrollingBackground.prototype.scroll = function (speed) {
            if (speed < 1) {
                return;
            }
            speed = Math.floor(speed * this._mGame.time.physicsElapsed);
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.LANDSCAPE) {
                this.scrollLandscape(speed);
                return;
            }
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.PORTRAIT) {
                this.scrollPortrait(speed);
                return;
            }
        };
        ScrollingBackground.prototype.scrollPortrait = function (speed) {
            for (var i = 0; i < this._mRows.length; i++) {
                this._mRows[i][0].mTransform.fastSetPosition(this._mRows[i][0].mTransform.mPosition.x, this._mRows[i][0].mTransform.mPosition.y + speed);
                this._mRows[i][1].mTransform.fastSetPosition(this._mRows[i][1].mTransform.mPosition.x, this._mRows[i][1].mTransform.mPosition.y + speed);
                this._mRows[i][2].mTransform.fastSetPosition(this._mRows[i][2].mTransform.mPosition.x, this._mRows[i][2].mTransform.mPosition.y + speed);
            }
            if (this._mRows[0][0].mTransform.mPosition.y > this._mGame.height + this._mRoadSize.y) {
                Phaser.ArrayUtils.rotate(this._mRows);
            }
            var lLowestPoint = new Phaser.Point(this._mRows[0][0].mTransform.mPosition.x, this._mRows[0][0].mTransform.mPosition.y);
            for (var j = 1; j < this._mRows.length; j++) {
                var y = lLowestPoint.y - (this._mRoadSize.y * j);
                this._mRows[j][0].mTransform.fastSetPosition(this._mRows[j][0].mTransform.mPosition.x, y);
                this._mRows[j][1].mTransform.fastSetPosition(this._mRows[j][1].mTransform.mPosition.x, y);
                this._mRows[j][2].mTransform.fastSetPosition(this._mRows[j][2].mTransform.mPosition.x, y);
                this._mRows[j][0].mTransform.fastSetRotation(0);
                this._mRows[j][1].mTransform.fastSetRotation(0);
                this._mRows[j][2].mTransform.fastSetRotation(0);
            }
        };
        ScrollingBackground.prototype.scrollLandscape = function (speed) {
            for (var i = 0; i < this._mRows.length; i++) {
                this._mRows[i][0].mTransform.fastSetPosition(this._mRows[i][0].mTransform.mPosition.x - speed, this._mRows[i][0].mTransform.mPosition.y);
                this._mRows[i][1].mTransform.fastSetPosition(this._mRows[i][1].mTransform.mPosition.x - speed, this._mRows[i][1].mTransform.mPosition.y);
                this._mRows[i][2].mTransform.fastSetPosition(this._mRows[i][2].mTransform.mPosition.x - speed, this._mRows[i][2].mTransform.mPosition.y);
            }
            if (this._mRows[0][0].mTransform.mPosition.x < 0 - this._mRoadSize.y / 2) {
                Phaser.ArrayUtils.rotate(this._mRows);
            }
            var lLowestPoint = new Phaser.Point(this._mRows[0][0].mTransform.mPosition.x, this._mRows[0][0].mTransform.mPosition.y);
            for (var j = 1; j < this._mRows.length; j++) {
                var x = lLowestPoint.x + (this._mRoadSize.y * j);
                this._mRows[j][0].mTransform.fastSetPosition(x, this._mRows[j][0].mTransform.mPosition.y);
                this._mRows[j][1].mTransform.fastSetPosition(x, this._mRows[j][1].mTransform.mPosition.y);
                this._mRows[j][2].mTransform.fastSetPosition(x, this._mRows[j][2].mTransform.mPosition.y);
                this._mRows[j][0].mTransform.fastSetRotation(90);
                this._mRows[j][1].mTransform.fastSetRotation(90);
                this._mRows[j][2].mTransform.fastSetRotation(90);
            }
        };
        ScrollingBackground.prototype.reSize = function () {
            this.align();
            this.scroll(2);
        };
        ScrollingBackground.prototype.clearRoad = function () {
            while (this._mRows.length > 0) {
                while (this._mRows[0].length > 0) {
                    if (Helper.exists(this._mRows[0][0])) {
                        Dlib.Dcore.mInstance.removeDobject(this._mRows[0].splice(0, 1)[0]);
                    }
                }
                this._mRows.splice(0, 1);
            }
        };
        ScrollingBackground.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mScrollPoint = null;
            this._mRoadSize = null;
            this._mTheme = null;
            this._mRows = null;
        };
        return ScrollingBackground;
    }(Dlib.Dobject));
    Race.ScrollingBackground = ScrollingBackground;
})(Race || (Race = {}));
var Race;
(function (Race) {
    var SparksParticle = (function (_super) {
        __extends(SparksParticle, _super);
        function SparksParticle() {
            _super.call(this, "SparksParticle");
        }
        SparksParticle.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            this._mEmitter = this._mGame.add.emitter(0, 0, 35);
            this._mEmitter.group = Dlib.Dlayer.mInstance.getLayer("Particles");
            this._mEmitter.makeParticles("Particle0");
            this._mEmitter.setAlpha(1, 0, 1000, Phaser.Easing.Quadratic.InOut);
            this._mEmitter.setScale(1.5, 0.5, 1.5, 0.5, 2000);
            this._mEmitter.height = 100;
            this._mEmitter.setYSpeed(500, 700);
            this._mEmitter.setRotation(-180, 180);
        };
        SparksParticle.prototype.startRight = function (position) {
            this._mEmitter.position = position;
            if (this.land()) {
                this._mEmitter.height = 0;
                this._mEmitter.width = 100;
                this._mEmitter.setYSpeed(-100, 100);
                this._mEmitter.setXSpeed(-500, -700);
            }
            else {
                this._mEmitter.height = 100;
                this._mEmitter.width = 0;
                this._mEmitter.setYSpeed(500, 700);
                this._mEmitter.setXSpeed(-100, 100);
            }
            this._mEmitter.start(false, 1000, 100);
            Dlib.Daudio.mInstance.playRepeating("RailScrape0");
        };
        SparksParticle.prototype.startLeft = function (position) {
            this._mEmitter.position = position;
            if (this.land()) {
                this._mEmitter.height = 0;
                this._mEmitter.width = 100;
                this._mEmitter.setYSpeed(-100, 100);
                this._mEmitter.setXSpeed(-500, -700);
            }
            else {
                this._mEmitter.height = 100;
                this._mEmitter.width = 0;
                this._mEmitter.setYSpeed(500, 700);
                this._mEmitter.setXSpeed(-100, 100);
            }
            this._mEmitter.start(false, 1000, 100);
            Dlib.Daudio.mInstance.playRepeating("RailScrape0");
        };
        SparksParticle.prototype.stop = function () {
            this._mEmitter.on = false;
            Dlib.Daudio.mInstance.stopRepeating("RailScrape0");
        };
        SparksParticle.prototype.update = function () {
            _super.prototype.update.call(this);
        };
        SparksParticle.prototype.land = function () {
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.LANDSCAPE) {
                return true;
            }
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.PORTRAIT) {
                return false;
            }
            return false;
        };
        SparksParticle.prototype.destroy = function () {
            this.stop();
            this._mEmitter.destroy();
            this._mEmitter = null;
        };
        return SparksParticle;
    }(Dlib.Dobject));
    Race.SparksParticle = SparksParticle;
})(Race || (Race = {}));
var Race;
(function (Race) {
    var testObject = (function (_super) {
        __extends(testObject, _super);
        function testObject(theme) {
            _super.call(this, "testObject");
        }
        testObject.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
        };
        testObject.prototype.update = function () {
            _super.prototype.update.call(this);
        };
        return testObject;
    }(Dlib.Dobject));
    Race.testObject = testObject;
})(Race || (Race = {}));
var Race;
(function (Race) {
    var TutorialOverlay = (function (_super) {
        __extends(TutorialOverlay, _super);
        function TutorialOverlay() {
            _super.call(this, "TutorialOverlay");
            this._mObjects = new Array();
        }
        TutorialOverlay.prototype.create = function (game) {
            _super.prototype.create.call(this, game);
            for (var i = 0; i < 4; i++) {
                this._mObjects.push(Dlib.Dcore.mInstance.createDobject(new Dlib.Dobject("TutorialImage")));
            }
            this._mObjects[0].addComponent(new Dlib.Image({ mAnchor: new Phaser.Point(0.5, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("Particles"), mKey: "TutorialHand0", mSheet: "Sheet0" }));
            this._mObjects[1].addComponent(new Dlib.Image({ mAnchor: new Phaser.Point(0.5, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("Particles"), mKey: "TutorialArrow0", mSheet: "Sheet0" }));
            this._mObjects[2].addComponent(new Dlib.Image({ mAnchor: new Phaser.Point(0.5, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("Particles"), mKey: "TutorialHand0", mSheet: "Sheet0" }));
            this._mObjects[3].addComponent(new Dlib.Image({ mAnchor: new Phaser.Point(0.5, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("Particles"), mKey: "TutorialArrow0", mSheet: "Sheet0" }));
            if (this.land()) {
                this._mObjects[2].mTransform.mScale = new Phaser.Point(-1, 1);
                this._mObjects[3].mTransform.mScale = new Phaser.Point(-1, 1);
                this._mObjects[0].mTransform.mPosition = new Phaser.Point(this._mGame.width * 0.25, 150);
                this._mObjects[1].mTransform.mPosition = new Phaser.Point(this._mGame.width * 0.5, 150);
                this._mObjects[2].mTransform.mPosition = new Phaser.Point(this._mGame.width * 0.25, 450);
                this._mObjects[3].mTransform.mPosition = new Phaser.Point(this._mGame.width * 0.5, 450);
                this._mObjects[0].mTransform.mRotation = 90;
                this._mObjects[1].mTransform.mRotation = 90;
                this._mObjects[2].mTransform.mRotation = 90;
                this._mObjects[3].mTransform.mRotation = 90;
            }
            else {
                this._mObjects[2].mTransform.mScale = new Phaser.Point(-1, 1);
                this._mObjects[3].mTransform.mScale = new Phaser.Point(-1, 1);
                this._mObjects[0].mTransform.mPosition = new Phaser.Point(150, this._mGame.height * 0.75);
                this._mObjects[1].mTransform.mPosition = new Phaser.Point(150, this._mGame.height * 0.5);
                this._mObjects[2].mTransform.mPosition = new Phaser.Point(450, this._mGame.height * 0.75);
                this._mObjects[3].mTransform.mPosition = new Phaser.Point(450, this._mGame.height * 0.5);
            }
            this.addComponent(new Dlib.Timer());
            var lTimer = this.getComponent("Timer");
            lTimer.addEvent(5000, this.destroySelf, this);
            lTimer.start();
        };
        TutorialOverlay.prototype.destroySelf = function () {
            this.clear();
            Dlib.Dcore.mInstance.removeDobject(this);
        };
        TutorialOverlay.prototype.clear = function () {
            while (this._mObjects.length > 0) {
                Dlib.Dcore.mInstance.removeDobject(this._mObjects.splice(0, 1)[0]);
            }
        };
        TutorialOverlay.prototype.land = function () {
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.LANDSCAPE) {
                return true;
            }
            if (Dlib.Dscreen.mInstance.mRotation === Dlib.ROTATION.PORTRAIT) {
                return false;
            }
            return false;
        };
        TutorialOverlay.prototype.destroy = function () {
            this._mObjects = null;
        };
        return TutorialOverlay;
    }(Dlib.Dobject));
    Race.TutorialOverlay = TutorialOverlay;
})(Race || (Race = {}));
var Race;
(function (Race) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.apply(this, arguments);
        }
        Game.prototype.init = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.prototype.init.call(this, args);
        };
        Game.prototype.shutdown = function () {
            _super.prototype.shutdown.call(this);
            this._mActiveLevel = null;
            Dlib.Dpause.gameResume();
        };
        Game.prototype.preload = function () {
            _super.prototype.preload.call(this);
            this._mProfile = Dlib.Dcore.mInstance.findObjectByName("RaceProfile");
        };
        Game.prototype.create = function () {
            _super.prototype.create.call(this);
            this.spawnLevel(this.game.cache.getJSON("LevelData").Levels[this._mProfile.mActiveLevel.LevelNumber]);
            this.activateGui("GameScreen");
            this._mActiveLevel.mGameOver.add(this.gameOver, this);
            this._mActiveLevel.mVictory.add(this.victory, this);
            this._mActiveLevel.start();
            if (this._mProfile.mActiveLevel.LevelNumber === 0) {
                Dlib.Dcore.mInstance.createDobject(new Race.TutorialOverlay());
            }
        };
        Game.prototype.lateVictory = function () {
            var lSter0 = Dlib.Dcore.mInstance.findObjectByName("Star0");
            var lSter1 = Dlib.Dcore.mInstance.findObjectByName("Star1");
            var lSter2 = Dlib.Dcore.mInstance.findObjectByName("Star2");
            this.victoryWinSound();
            switch (this._mActiveLevel.stars()) {
                case 1:
                    break;
                case 2:
                    lSter0.getComponent(Dlib.Sprite).mAnimation.onComplete
                        .addOnce(lSter1.playAnimation, lSter1, null, false);
                    lSter0.getComponent(Dlib.Sprite).mAnimation.onComplete
                        .addOnce(this.victoryWinSound, this);
                    break;
                case 3:
                    lSter0.getComponent(Dlib.Sprite).mAnimation.onComplete
                        .addOnce(lSter1.playAnimation, lSter1, null, false);
                    lSter1.getComponent(Dlib.Sprite).mAnimation.onComplete
                        .addOnce(lSter2.playAnimation, lSter2, null, false);
                    lSter0.getComponent(Dlib.Sprite).mAnimation.onComplete
                        .addOnce(this.victoryWinSound, this);
                    lSter1.getComponent(Dlib.Sprite).mAnimation.onComplete
                        .addOnce(this.victoryWinSound, this);
                    break;
                default:
            }
            lSter0.mTweenComplete.addOnce(lSter0.playAnimation, lSter0, null, false);
            Dlib.Dcore.mInstance.createDobject(new Race.Confettie()).start();
        };
        Game.prototype.victoryWinSound = function () {
            Dlib.Daudio.mInstance.playOnceTag("WinStar");
        };
        Game.prototype.victory = function () {
            this.activateGui("WinScreen", this.lateVictory, this);
            this._mProfile.completeLevel(this._mProfile.mActiveLevel.LevelNumber, this._mActiveLevel.stars());
            this._mProfile.saveProfile();
            Dlib.Daudio.mInstance.stopMusic();
            Dlib.Daudio.mInstance.setMusic("RaceVictoryTuneLevelComplete", true);
            Dlib.Daudio.mInstance.startMusic(false);
        };
        Game.prototype.gameOver = function () {
            this.activateGui("LoseScreen");
            Dlib.Daudio.mInstance.stopMusic();
            Dlib.Daudio.mInstance.setMusic("RaceDefeatLevelGameOver", true);
            Dlib.Daudio.mInstance.startMusic(false);
        };
        Game.prototype.restart = function () {
            Dlib.Dpause.mInstance.mGamePaused = false;
            this._mActiveLevel.reset();
            this.activateGui("GameScreen");
            this._mActiveLevel.start();
        };
        Game.prototype.moreGames = function () {
            window.open("http://www.funnygames.nu/");
        };
        Game.prototype.levelSelect = function () {
            this.switchState("levelSelect", true);
        };
        Game.prototype.pause = function () {
            Dlib.Dpause.mInstance.mGamePaused = true;
        };
        Game.prototype.lateResume = function () {
            this._mActiveLevel.fixHearths();
        };
        Game.prototype.resume = function () {
            Dlib.Dpause.mInstance.mGamePaused = false;
        };
        Game.prototype.menu = function () {
            this.switchState("menu", true);
        };
        Game.prototype.spawnLevel = function (level) {
            if (Helper.exists(this._mActiveLevel)) {
                this.removeActiveLevel();
            }
            this._mActiveLevel = Dlib.Dcore.mInstance.createDobject(new Race.Level(level));
        };
        Game.prototype.removeActiveLevel = function () {
            if (Helper.exists(this._mActiveLevel)) {
                this._mActiveLevel.clear();
                Dlib.Dcore.mInstance.removeDobject(this._mActiveLevel);
                this._mActiveLevel = null;
            }
        };
        Game.prototype.reSize = function () {
            _super.prototype.reSize.call(this);
            this._mActiveLevel.reSize();
        };
        Game.prototype.gamePause = function () {
            _super.prototype.gamePause.call(this);
            this.activateGui("PauseScreen");
            this._mActiveLevel.pause();
            Dlib.Daudio.mInstance.pauseMusic();
        };
        Game.prototype.gameResume = function () {
            _super.prototype.gameResume.call(this);
            this.activateGui("GameScreen", this.lateResume, this);
            this._mActiveLevel.resume();
            Dlib.Daudio.mInstance.resumeMusic();
        };
        Game.prototype.fullPause = function () {
            console.log("pause");
            _super.prototype.fullPause.call(this);
            Dlib.Daudio.mInstance.pauseMusic();
            if (Dlib.Dpause.mInstance.mGamePaused) {
                return;
            }
            else {
                this._mActiveLevel.pause();
            }
        };
        Game.prototype.fullResume = function () {
            console.log("resume");
            _super.prototype.fullResume.call(this);
            if (Dlib.Dpause.mInstance.mGamePaused) {
                return;
            }
            else {
                Dlib.Daudio.mInstance.resumeMusic();
                this._mActiveLevel.resume();
            }
        };
        return Game;
    }(Dlib.Dstate));
    Race.Game = Game;
})(Race || (Race = {}));
var Race;
(function (Race) {
    var LevelSelect = (function (_super) {
        __extends(LevelSelect, _super);
        function LevelSelect() {
            _super.apply(this, arguments);
        }
        LevelSelect.prototype.init = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.prototype.init.call(this, args);
        };
        LevelSelect.prototype.shutdown = function () {
            _super.prototype.shutdown.call(this);
            this._mBackground = null;
            this._mButtons = null;
            this._mPage = null;
            this._mProfile = null;
        };
        LevelSelect.prototype.preload = function () {
            _super.prototype.preload.call(this);
            this._mButtons = new Array();
        };
        LevelSelect.prototype.create = function () {
            _super.prototype.create.call(this);
            this.activateGui("LevelSelect");
            this.getAllButtons();
            this._mProfile = Dlib.Dcore.mInstance.findObjectByName("RaceProfile");
            this._mPage = this._mProfile.mActivePage || 0;
            this.assignButtons();
            this._mBackground = Dlib.Dcore.mInstance.createDobject(new Dlib.Background("LevelSelectBackground0"));
            Dlib.Daudio.mInstance.setMusic("RaceTitleMusic", true);
            Dlib.Daudio.mInstance.startMusic(true);
        };
        LevelSelect.prototype.getAllButtons = function () {
            for (var i = 0; i < 6; i++) {
                this._mButtons.push([]);
                this._mButtons[i].push(Dlib.Dcore.mInstance.findObjectByName("LevelSelectText" + i.toString()));
                this._mButtons[i].push(Dlib.Dcore.mInstance.findObjectByName("LevelSelectButton" + i.toString()));
                this._mButtons[i].push(Dlib.Dcore.mInstance.findObjectByName("LevelStars" + i.toString()));
                this._mButtons[i].push(Dlib.Dcore.mInstance.findObjectByName("LevelSelectCar" + i.toString()));
            }
        };
        LevelSelect.prototype.reSize = function () {
            _super.prototype.reSize.call(this);
            this._mButtons = new Array();
            this.getAllButtons();
            this.assignButtons();
        };
        LevelSelect.prototype.assignButtons = function () {
            var startNumber = 0;
            switch (this._mPage) {
                case 0:
                    startNumber = 0;
                    break;
                case 1:
                    startNumber = 6;
                    break;
                case 2:
                    startNumber = 12;
                    break;
                case 3:
                    startNumber = 18;
                    break;
                default:
                    startNumber = 0;
            }
            for (var i = startNumber; i < startNumber + 6; i++) {
                var lLevel = this._mProfile.getLevel(i);
                var lButtonNumber = i - startNumber;
                if (Helper.exists(lLevel)) {
                    switch (lLevel.State) {
                        case Race.PROFILELEVEL.LOCKED:
                            this.lockButton(this._mButtons[lButtonNumber], i);
                            break;
                        case Race.PROFILELEVEL.UNLOCKED:
                            this.unlockButton(this._mButtons[lButtonNumber], i);
                            break;
                        case Race.PROFILELEVEL.COMPLTED:
                            this.completeButton(this._mButtons[lButtonNumber], i, lLevel.Stars);
                            break;
                        default:
                    }
                }
                else {
                    this.lockButton(this._mButtons[lButtonNumber], i);
                }
            }
            this._mActiveGui.tweenIn();
        };
        LevelSelect.prototype.unlockButton = function (buttonArray, levelIndex) {
            buttonArray[0].mEnabled = true;
            buttonArray[0].setText((levelIndex + 1).toString());
            buttonArray[1].setButton({ mKey: "LevelSelectButton", mSheet: "Sheet0", mAnchor: new Phaser.Point(0.5, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("GUI") });
            buttonArray[2].mEnabled = true;
            buttonArray[2].setImage({ mKey: "LevelStarsEmpty0", mSheet: "Sheet0", mAnchor: new Phaser.Point(0.5, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("GUI") });
            buttonArray[3].mEnabled = true;
            buttonArray[3].setImage({ mKey: "CarUnique" + levelIndex.toString(), mSheet: "LevelButtonCars0", mAnchor: new Phaser.Point(0.5, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("GUI") });
        };
        LevelSelect.prototype.lockButton = function (buttonArray, levelIndex) {
            buttonArray[0].setText((levelIndex + 1).toString());
            buttonArray[1].setButton({ mKey: "LevelSelectButtonLocked", mSheet: "Sheet0", mAnchor: new Phaser.Point(0.5, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("GUI") });
            buttonArray[2].mEnabled = false;
            buttonArray[3].mEnabled = false;
        };
        LevelSelect.prototype.completeButton = function (buttonArray, levelIndex, stars) {
            buttonArray[0].mEnabled = true;
            buttonArray[0].setText((levelIndex + 1).toString());
            buttonArray[1].setButton({ mKey: "LevelSelectButtonCompleted", mSheet: "Sheet0", mAnchor: new Phaser.Point(0.5, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("GUI") });
            var starKey;
            switch (stars) {
                case 1:
                    starKey = "LevelStarsBronze0";
                    break;
                case 2:
                    starKey = "LevelStarsBronzeSilver0";
                    break;
                case 3:
                    starKey = "LevelStarsBronzeSilverGold0";
                    break;
                default:
                    starKey = "LevelStarsBronze0";
            }
            buttonArray[2].mEnabled = true;
            buttonArray[2].setImage({ mKey: starKey, mSheet: "Sheet0", mAnchor: new Phaser.Point(0.5, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("GUI") });
            buttonArray[3].mEnabled = true;
            buttonArray[3].setImage({ mKey: "CarUnique" + levelIndex.toString(), mSheet: "LevelButtonCars0", mAnchor: new Phaser.Point(0.5, 0.5), mGroup: Dlib.Dlayer.mInstance.getLayer("GUI") });
        };
        LevelSelect.prototype.getLevelNumber = function (nr) {
            var startNumber = 0;
            switch (this._mPage) {
                case 0:
                    startNumber = 0;
                    break;
                case 1:
                    startNumber = 6;
                    break;
                case 2:
                    startNumber = 12;
                    break;
                case 3:
                    startNumber = 18;
                    break;
                default:
                    startNumber = 0;
            }
            return startNumber + nr;
        };
        LevelSelect.prototype.startGame = function (levelNumber) {
            if (this._mProfile.getLevel(levelNumber).State === Race.PROFILELEVEL.LOCKED) {
                return;
            }
            this._mProfile.mActiveLevel = this._mProfile.getLevel(levelNumber);
            this._mProfile.mActivePage = this._mPage;
            this.switchState("game", true);
        };
        LevelSelect.prototype.menu = function () {
            this.switchState("menu", true);
        };
        LevelSelect.prototype.levelButton0 = function () {
            this.startGame(this.getLevelNumber(0));
        };
        LevelSelect.prototype.levelButton1 = function () {
            this.startGame(this.getLevelNumber(1));
        };
        LevelSelect.prototype.levelButton2 = function () {
            this.startGame(this.getLevelNumber(2));
        };
        LevelSelect.prototype.levelButton3 = function () {
            this.startGame(this.getLevelNumber(3));
        };
        LevelSelect.prototype.levelButton4 = function () {
            this.startGame(this.getLevelNumber(4));
        };
        LevelSelect.prototype.levelButton5 = function () {
            this.startGame(this.getLevelNumber(5));
        };
        LevelSelect.prototype.previous = function () {
            if (this._mPage > 0) {
                this._mPage--;
                this._mActiveGui.tweenOut(this.assignButtons, this);
            }
            else {
                this.menu();
            }
        };
        LevelSelect.prototype.next = function () {
            if (this._mPage < 2) {
                this._mPage++;
                this._mActiveGui.tweenOut(this.assignButtons, this);
            }
        };
        LevelSelect.prototype.fullPause = function () {
            _super.prototype.fullPause.call(this);
            Dlib.Daudio.mInstance.pauseMusic();
        };
        LevelSelect.prototype.fullResume = function () {
            _super.prototype.fullResume.call(this);
            Dlib.Daudio.mInstance.resumeMusic();
        };
        return LevelSelect;
    }(Dlib.Dstate));
    Race.LevelSelect = LevelSelect;
})(Race || (Race = {}));
var Race;
(function (Race) {
    var Menu = (function (_super) {
        __extends(Menu, _super);
        function Menu() {
            _super.apply(this, arguments);
        }
        Menu.prototype.init = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.prototype.init.call(this, args);
        };
        Menu.prototype.shutdown = function () {
            _super.prototype.shutdown.call(this);
        };
        Menu.prototype.preload = function () {
            _super.prototype.preload.call(this);
        };
        Menu.prototype.create = function () {
            _super.prototype.create.call(this);
            Dlib.Dcore.mInstance.createDobject(new Dlib.Background("TitleScreenBackground0"));
            this.activateGui("TitleScreen", this.titleShake, this);
            Dlib.Daudio.mInstance.setMusic("RaceTitleMusic", true);
            Dlib.Daudio.mInstance.startMusic(true);
        };
        Menu.prototype.titleShake = function () {
            Dlib.Dcore.mInstance.findObjectByName("GameTitle").addComponent(new Race.SpriteShakeComponent(0.005, 25)).mShake = true;
        };
        Menu.prototype.moreGames = function () {
            window.open("http://www.funnygames.nu/");
        };
        Menu.prototype.update = function () {
            _super.prototype.update.call(this);
        };
        Menu.prototype.levelSelect = function () {
            this.switchState("levelSelect", true);
        };
        Menu.prototype.info = function () {
            this.activateGui("InfoScreen");
        };
        Menu.prototype.menu = function () {
            this.activateGui("TitleScreen", this.titleShake, this);
        };
        Menu.prototype.fullPause = function () {
            console.log("pause");
            _super.prototype.fullPause.call(this);
            Dlib.Daudio.mInstance.pauseMusic();
        };
        Menu.prototype.fullResume = function () {
            console.log("resume");
            _super.prototype.fullResume.call(this);
            Dlib.Daudio.mInstance.resumeMusic();
        };
        return Menu;
    }(Dlib.Dstate));
    Race.Menu = Menu;
})(Race || (Race = {}));
var Race;
(function (Race) {
    var RaceBoot = (function (_super) {
        __extends(RaceBoot, _super);
        function RaceBoot() {
            _super.apply(this, arguments);
        }
        RaceBoot.prototype.init = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.prototype.init.call(this, args);
            this.game.forceSingleUpdate = true;
        };
        RaceBoot.prototype.shutdown = function () {
            _super.prototype.shutdown.call(this);
        };
        RaceBoot.prototype.preload = function () {
            _super.prototype.preload.call(this);
            this.game.load.json("LevelData", "json/LevelData.json");
            this.game.load.json("AudioTags", "json/AudioTags.json");
        };
        RaceBoot.prototype.create = function () {
            _super.prototype.create.call(this);
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            Dlib.Dcore.mInstance.createDobject(new Race.RaceProfile());
            var lProfile = Dlib.Dcore.mInstance.findObjectByName("RaceProfile");
            if (lProfile.loadProfile() === false) {
                lProfile.newProfile();
            }
            Dlib.Dcore.mInstance.doNotDestroy(lProfile);
            Dlib.Daudio.mInstance.loadTags("AudioTags");
            this.switchState("menu");
        };
        return RaceBoot;
    }(Dlib.Dstate));
    Race.RaceBoot = RaceBoot;
})(Race || (Race = {}));
//# sourceMappingURL=GobletGames.js.map