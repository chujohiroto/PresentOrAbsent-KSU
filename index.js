const line = require('@line/bot-sdk');
const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;
const app = new express();
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

const clovaSkillHandler = clova.Client
    .configureSkill()
    .onLaunchRequest(responseHelper => {
        responseHelper.setSimpleSpeech({
            lang: 'ja',
            type: 'PlainText',
            value: '大学に間に合うかな',
        });
    })
    .onIntentRequest(async responseHelper => {
        const intent = responseHelper.getIntentName();
        const sessionId = responseHelper.getSessionId();
        console.log("intent:" + intent);

        switch (intent) {
            case 'class_set':
                const slots = responseHelper.getSlots();

                if (!('class' in slots)) {
                    speech = {
                        lang: 'ja',
                        type: 'PlainText',
                        value: `知らない言葉だよーん`
                    }
                    responseHelper.setSimpleSpeech(speech)
                    break
                }
                // Slotに登録されていない星座はnullになる
                if (slots.class == null) {
                    speech = {
                        lang: 'ja',
                        type: 'PlainText',
                        value: `そんな時間の言葉しらねえよ`
                    }
                    responseHelper.setSimpleSpeech(speech)
                    // 第2引数にtrueを設定するとreprompt(入力が行われなかった場合の聞き返し)の文を定義できる
                    responseHelper.setSimpleSpeech(speech, true)
                    // 下記でも可
                    /*
                    responseHelper.setSimpleSpeech(
                      clova.SpeechBuilder.createSpeechText(`星座に誤りがあります。他の星座でお試し下さい。`)
                    );
                    */
                }
                // Build speechObject directly for response
                var m = getMessage(slots.class)

                responseHelper.setSpeechList([
                    {
                        lang: '',
                        type: 'URL',
                        value: getSound(m),
                    },
                    {
                        lang: 'ja',
                        type: 'PlainText',
                        value: m,
                    }
                ]);

                if (m != "諦めろ") {
                    responseHelper.endSession();
                }
                break;

            case 'Clova.NoIntent':
                // Or build speechObject with SpeechBuilder for response
                responseHelper.setSimpleSpeech(
                    clova.SpeechBuilder.createSpeechText('何限か言えよ')
                );
                break;
        }
    })
    .onSessionEndedRequest(responseHelper => {
        const sessionId = responseHelper.getSessionId();
        // Do something on session end
    })
    .handle();

const clovaMiddleware = clova.Middleware({ applicationId: process.env.APPLICATION_ID });

// Use `clovaMiddleware` if you want to verify signature and applicationId.
// Please note `applicationId` is required when using this middleware.
app.post('/clova', clovaMiddleware, clovaSkillHandler);

// Or you can simply use `bodyParser.json()` to accept any request without verifying, e.g.,
app.post('/clova', bodyParser.json(), clovaSkillHandler);

app.post('/webhook', line.middleware(line_config), (req, res, next) => {
    res.sendStatus(200);

    let events_processed = [];

    // イベントオブジェクトを順次処理。
    req.body.events.forEach((event) => {
        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" && event.message.type == "text") {
            if (event.message.text == "check" || event.message.text == "Check" || event.message.text == "チェック") {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    "type": "flex",
                    "altText": "This is a flex message",
                    "contents": {
                        "type": "bubble",
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "何限目??",
                                    "weight": "bold",
                                    "size": "xl"
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "margin": "lg",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "box",
                                            "layout": "baseline",
                                            "spacing": "sm",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "Place",
                                                    "color": "#aaaaaa",
                                                    "size": "sm",
                                                    "flex": 1
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "京都産業大学",
                                                    "wrap": true,
                                                    "color": "#666666",
                                                    "size": "sm",
                                                    "flex": 5
                                                }
                                            ]
                                        },
                                        {
                                            "type": "box",
                                            "layout": "baseline",
                                            "spacing": "sm",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "Time",
                                                    "color": "#aaaaaa",
                                                    "size": "sm",
                                                    "flex": 1
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "1限目から8限目",
                                                    "wrap": true,
                                                    "color": "#666666",
                                                    "size": "sm",
                                                    "flex": 5
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        "footer": {
                            "type": "box",
                            "layout": "vertical",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "button",
                                    "style": "link",
                                    "height": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "1限目",
                                        "text": "1限目"
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "link",
                                    "height": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "2限目",
                                        "text": "2限目"
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "link",
                                    "height": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "3限目",
                                        "text": "3限目"
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "link",
                                    "height": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "4限目",
                                        "text": "4限目"
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "link",
                                    "height": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "5限目",
                                        "text": "5限目"
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "link",
                                    "height": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "6限目",
                                        "text": "6限目"
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "link",
                                    "height": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "7限目",
                                        "text": "7限目"
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "link",
                                    "height": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "8限目",
                                        "text": "8限目"
                                    }
                                },

                                {
                                    "type": "spacer",
                                    "size": "sm"
                                }
                            ],
                            "flex": 0
                        }
                    },
                }));
            }
            else {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: getMessage(event.message.text)
                }));
            }
        }
        else {
            events_processed.push(bot.replyMessage(event.replyToken, {
                type: "text",
                text: "テキストメッセージで入力してください"
            }));
        }
    });
    // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    );
});

app.listen(PORT, function () {
    //console.log("Node.js is listening to PORT:" + server.address().port);
});

function getSound(m) {
    if (m != "諦めろ") {
        return "https://soundeffect-lab.info/sound/battle/mp3/magic-cure4.mp3";
    }
    else {
        return "https://soundeffect-lab.info/sound/battle/mp3/sword-slash4.mp3";
    }
}


function getMessage(t) {
    var dtl = getTimeLesson(t);

    dtl.setMinutes(dtl.getMinutes() - 30);

    var h = dtl.getTime() - getnow().getTime();

    var t = getnow().getTime() - getToday().getTime();

    var ti = h - t;
    //var ti = dtl.getTime() - getnow().getTime();

    console.log(ti);
    //秒数で判定
    if (ti > 0) {
        var t2 = Math.ceil(ti / 1000);
        return "間に合うよ。残り" + String(t2).toString() + "秒";
    } else {
        return "諦めろ";
    }
}


function getTimeLesson(t) {
    var lesson;
    var tint = Number(t)
    switch (tint) {
        case 1:
            lesson = new Date(new Date().setHours(9, 0, 0, 0));
            break;
        case 2:
            lesson = new Date(new Date().setHours(10, 30, 0, 0));
            break;
        case 3:
            lesson = new Date(new Date().setHours(13, 0, 0, 0));
            break;
        case 4:
            lesson = new Date(new Date().setHours(14, 30, 0, 0));
            break;
        case 5:
            lesson = new Date(new Date().setHours(16, 0, 0, 0));
            break;
        case 6:
            lesson = new Date(new Date().setHours(17, 30, 0, 0));
            break;
        case 7:
            lesson = new Date(new Date().setHours(19, 0, 0, 0));
            break;
        case 8:
            lesson = new Date(new Date().setHours(21, 30, 0, 0));
            break;
        default:
            lesson = new Date(new Date().setHours(0, 0, 0, 0));
            break;
    }
    return lesson;
}

function getToday() {
    var today = new Date(new Date().setHours(0, 0, 0, 0));
    return today;
}

function getnow() {
    var now = new Date();
    return now;
}
