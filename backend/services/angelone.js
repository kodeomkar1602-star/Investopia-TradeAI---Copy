// ============================================================
// ANGEL ONE SMARTAPI SERVICE
// ============================================================

const { SmartAPI } = require("smartapi-javascript");
const { generate } = require("otplib");


// ============================================================
// ANGEL ONE CONFIGURATION
// ============================================================

const ANGELONE_API_KEY =
    process.env.ANGELONE_API_KEY;

const ANGELONE_CLIENT_CODE =
    process.env.ANGELONE_CLIENT_CODE;

const ANGELONE_PASSWORD =
    process.env.ANGELONE_PASSWORD;

const ANGELONE_TOTP_SECRET =
    process.env.ANGELONE_TOTP_SECRET;


// ============================================================
// SMARTAPI INSTANCE
// ============================================================

let smartApi = null;


// ============================================================
// SESSION DATA
// ============================================================

let accessToken = null;

let refreshToken = null;

let feedToken = null;

let sessionCreatedAt = null;


// ============================================================
// CHECK ANGEL ONE CONFIGURATION
// ============================================================

function checkAngelOneConfig() {

    const missing = [];


    if (!ANGELONE_API_KEY) {

        missing.push(
            "ANGELONE_API_KEY"
        );

    }


    if (!ANGELONE_CLIENT_CODE) {

        missing.push(
            "ANGELONE_CLIENT_CODE"
        );

    }


    if (!ANGELONE_PASSWORD) {

        missing.push(
            "ANGELONE_PASSWORD"
        );

    }


    if (!ANGELONE_TOTP_SECRET) {

        missing.push(
            "ANGELONE_TOTP_SECRET"
        );

    }


    if (missing.length > 0) {

        throw new Error(

            `Missing Angel One environment variables: ${missing.join(", ")}`

        );

    }

}


// ============================================================
// CREATE SMARTAPI INSTANCE
// ============================================================

function createSmartApi() {

    checkAngelOneConfig();


    smartApi = new SmartAPI({

        api_key:
            ANGELONE_API_KEY

    });


    return smartApi;

}


// ============================================================
// GENERATE CURRENT TOTP
// ============================================================

async function generateTOTP() {

    checkAngelOneConfig();


    const totp =
        await generate({

            secret:
                ANGELONE_TOTP_SECRET

        });


    return totp;

}


// ============================================================
// GENERATE ANGEL ONE SESSION
// ============================================================

async function generateAngelOneSession() {

    checkAngelOneConfig();


    // --------------------------------------------------------
    // CREATE SMARTAPI INSTANCE IF NEEDED
    // --------------------------------------------------------

    if (!smartApi) {

        createSmartApi();

    }


    // --------------------------------------------------------
    // GENERATE TOTP
    // --------------------------------------------------------

    const totp =
        await generateTOTP();


    console.log(
        "Generating Angel One SmartAPI session..."
    );


    // --------------------------------------------------------
    // LOGIN
    // --------------------------------------------------------

    const response =
        await smartApi.generateSession(

            ANGELONE_CLIENT_CODE,

            ANGELONE_PASSWORD,

            totp

        );


    // --------------------------------------------------------
    // CHECK RESPONSE
    // --------------------------------------------------------

    if (
        !response ||
        !response.status
    ) {

        console.error(
            "Angel One Session Error:",
            response
        );


        throw new Error(

            response?.message ||

            response?.errorcode ||

            "Angel One authentication failed."

        );

    }


    // --------------------------------------------------------
    // SAVE TOKENS
    // --------------------------------------------------------

    accessToken =
        response.data?.jwtToken ||
        null;


    refreshToken =
        response.data?.refreshToken ||
        null;


    feedToken =
        response.data?.feedToken ||
        null;


    sessionCreatedAt =
        new Date();


    console.log(
        "Angel One SmartAPI session created successfully."
    );


    return {

        success: true,

        message:
            "Angel One authentication successful.",

        sessionCreatedAt:
            sessionCreatedAt

    };

}


// ============================================================
// GET SMARTAPI INSTANCE
// ============================================================

async function getSmartApi() {

    // --------------------------------------------------------
    // CREATE INSTANCE IF NEEDED
    // --------------------------------------------------------

    if (!smartApi) {

        createSmartApi();

    }


    // --------------------------------------------------------
    // CREATE SESSION IF NOT AUTHENTICATED
    // --------------------------------------------------------

    if (!accessToken) {

        await generateAngelOneSession();

    }


    return smartApi;

}


// ============================================================
// GET ANGEL ONE USER PROFILE
// ============================================================

async function getAngelOneProfile() {

    const api =
        await getSmartApi();


    const response =
        await api.getProfile();


    return response;

}


// ============================================================
// SEARCH STOCK / SCRIP
// ============================================================

async function searchStock(
    exchange,
    searchText
) {

    const api =
        await getSmartApi();


    const cleanExchange =
        exchange
            .trim()
            .toUpperCase();


    const cleanSearch =
        searchText
            .trim()
            .toUpperCase();


    const response =
        await api.searchScrip(

            cleanExchange,

            cleanSearch

        );


    return response;

}


// ============================================================
// GET STOCK LTP
// ============================================================

async function getStockLTP(
    exchange,
    tradingSymbol,
    symbolToken
) {

    const api =
        await getSmartApi();


    const cleanExchange =
        exchange
            .trim()
            .toUpperCase();


    const cleanSymbol =
        tradingSymbol
            .trim()
            .toUpperCase();


    const cleanToken =
        String(symbolToken);


    const response =
        await api.getLtpData(

            cleanExchange,

            cleanSymbol,

            cleanToken

        );


    return response;

}


// ============================================================
// GET MARKET DATA
// ============================================================

async function getMarketData(
    mode,
    exchangeTokens
) {

    const api =
        await getSmartApi();


    const response =
        await api.getMarketData(

            mode,

            exchangeTokens

        );


    return response;

}


// ============================================================
// GET HISTORICAL CANDLE DATA
// ============================================================

async function getCandleData(

    exchange,

    symbolToken,

    interval,

    fromDate,

    toDate

) {

    const api =
        await getSmartApi();


    const response =
        await api.getCandleData({

            exchange:
                exchange
                    .trim()
                    .toUpperCase(),

            symboltoken:
                String(symbolToken),

            interval:
                interval,

            fromdate:
                fromDate,

            todate:
                toDate

        });


    return response;

}


// ============================================================
// GET SESSION STATUS
// ============================================================

function getAngelOneSessionStatus() {

    return {

        configured:
            Boolean(

                ANGELONE_API_KEY &&

                ANGELONE_CLIENT_CODE &&

                ANGELONE_PASSWORD &&

                ANGELONE_TOTP_SECRET

            ),

        authenticated:
            Boolean(accessToken),

        sessionCreatedAt:
            sessionCreatedAt

    };

}


// ============================================================
// GET ACCESS TOKEN
// ============================================================

function getAccessToken() {

    return accessToken;

}


// ============================================================
// GET REFRESH TOKEN
// ============================================================

function getRefreshToken() {

    return refreshToken;

}


// ============================================================
// GET FEED TOKEN
// ============================================================

function getFeedToken() {

    return feedToken;

}


// ============================================================
// LOGOUT / CLEAR SESSION
// ============================================================

function clearAngelOneSession() {

    accessToken = null;

    refreshToken = null;

    feedToken = null;

    sessionCreatedAt = null;

    console.log(
        "Angel One local session cleared."
    );

}


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    generateAngelOneSession,

    getAngelOneProfile,

    searchStock,

    getStockLTP,

    getMarketData,

    getCandleData,

    getAngelOneSessionStatus,

    getAccessToken,

    getRefreshToken,

    getFeedToken,

    clearAngelOneSession

};