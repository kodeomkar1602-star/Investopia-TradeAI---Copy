// ============================================================
// INVESTOPIA TRADEAI BACKEND SERVER
// ============================================================

require("dotenv").config();

// ============================================================
// IMPORT PACKAGES
// ============================================================

const express = require("express");
const cors = require("cors");

// ============================================================
// IMPORT ANGEL ONE SERVICES
// ============================================================

const {
    generateAngelOneSession,
    getAngelOneProfile,
    searchStock,
    getStockLTP,
    getMarketData,
    getCandleData,
    getAngelOneSessionStatus
} = require("./services/angelone");

// ============================================================
// CREATE EXPRESS APP
// ============================================================

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());

// ============================================================
// PORT
// ============================================================

const PORT =
    process.env.PORT || 5000;

// ============================================================
// BASIC SERVER TEST
// ============================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Investopia TradeAI backend is running.",

            provider:
                "Angel One SmartAPI"

        });

    }
);

// ============================================================
// OPENROUTER AI CHAT
// ============================================================

app.post(
    "/api/chat",
    async (req, res) => {

        try {

            const {

                question,

                conversation = [],

                system_prompt,

                expand = false

            } = req.body;

            // =================================================
            // CHECK QUESTION
            // =================================================

            if (!question) {

                return res.status(400).json({

                    error:
                        "Question is required."

                });

            }

            // =================================================
            // CHECK OPENROUTER CONFIGURATION
            // =================================================

            if (!process.env.OPENROUTER_API_KEY) {

                console.error(
                    "OPENROUTER_API_KEY is missing."
                );

                return res.status(500).json({

                    error:
                        "OpenRouter API key is not configured on the backend."

                });

            }

            if (!process.env.OPENROUTER_MODEL) {

                console.error(
                    "OPENROUTER_MODEL is missing."
                );

                return res.status(500).json({

                    error:
                        "OpenRouter model is not configured on the backend."

                });

            }

            // =================================================
            // CREATE MESSAGES
            // =================================================

            const messages = [];

            if (system_prompt) {

                messages.push({

                    role: "system",

                    content:
                        system_prompt

                });

            }

            if (Array.isArray(conversation)) {

                messages.push(
                    ...conversation.filter(
                        message =>
                            message &&
                            (
                                message.role === "user" ||
                                message.role === "assistant" ||
                                message.role === "system"
                            ) &&
                            typeof message.content === "string"
                    )
                );

            }

            messages.push({

                role: "user",

                content:
                    question

            });

            // =================================================
            // CALL OPENROUTER
            // =================================================

            console.log(
                "Sending request to OpenRouter..."
            );

            console.log(
                "OpenRouter model:",
                process.env.OPENROUTER_MODEL
            );

            const response =
                await fetch(

                    "https://openrouter.ai/api/v1/chat/completions",

                    {

                        method: "POST",

                        headers: {

                            "Authorization":
                                `Bearer ${process.env.OPENROUTER_API_KEY}`,

                            "Content-Type":
                                "application/json",

                            "HTTP-Referer":
                                process.env.FRONTEND_URL ||
                                "https://investopia-tradeai-copy-1.onrender.com",

                            "X-Title":
                                "Investopia TradeAI"

                        },

                        body:
                            JSON.stringify({

                                model:
                                    process.env.OPENROUTER_MODEL,

                                messages:
                                    messages,

                                temperature:
                                    0.4,

                                max_tokens:
                                    expand
                                        ? 2200
                                        : 900

                            })

                    }

                );

            // =================================================
            // READ RESPONSE
            // =================================================

            const data =
                await response.json();

            // =================================================
            // OPENROUTER ERROR
            // =================================================

            if (!response.ok) {

                console.error(
                    "OpenRouter Error:",
                    data
                );

                return res.status(
                    response.status
                ).json({

                    error:

                        data?.error?.message ||

                        "OpenRouter request failed."

                });

            }

            // =================================================
            // GET AI ANSWER
            // =================================================

            const answer =
                data
                    ?.choices?.[0]
                    ?.message?.content;

            if (!answer) {

                console.error(
                    "OpenRouter returned no answer:",
                    data
                );

                return res.status(500).json({

                    error:
                        "No AI response received."

                });

            }

            // =================================================
            // SEND AI ANSWER
            // =================================================

            res.json({

                success:
                    true,

                answer:
                    answer

            });

        }

        catch (error) {

            console.error(
                "AI Server Error:",
                error
            );

            res.status(500).json({

                error:
                    error.message ||
                    "AI server error."

            });

        }

    }
);

// ============================================================
// ANGEL ONE CONFIGURATION / SESSION STATUS
// ============================================================

app.get(
    "/api/angelone/status",
    (req, res) => {

        try {

            const status =
                getAngelOneSessionStatus();

            res.json({

                success: true,

                data:
                    status

            });

        }

        catch (error) {

            console.error(
                "Angel One Status Error:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);

// ============================================================
// ANGEL ONE AUTHENTICATION TEST
// ============================================================

app.get(
    "/api/angelone/test",
    async (req, res) => {

        try {

            const result =
                await generateAngelOneSession();

            res.json({

                success: true,

                message:
                    result.message,

                sessionCreatedAt:
                    result.sessionCreatedAt

            });

        }

        catch (error) {

            console.error(
                "Angel One Authentication Error:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);

// ============================================================
// ANGEL ONE PROFILE
// ============================================================

app.get(
    "/api/angelone/profile",
    async (req, res) => {

        try {

            const profile =
                await getAngelOneProfile();

            res.json({

                success: true,

                data:
                    profile

            });

        }

        catch (error) {

            console.error(
                "Angel One Profile Error:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);

// ============================================================
// SEARCH STOCK
// ============================================================

app.get(
    "/api/stocks/search",
    async (req, res) => {

        try {

            const search =
                req.query.search;

            const exchange =
                req.query.exchange ||
                "NSE";

            if (!search) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Search text is required."

                });

            }

            const data =
                await searchStock(
                    exchange,
                    search
                );

            res.json({

                success: true,

                exchange:
                    exchange
                        .trim()
                        .toUpperCase(),

                search:
                    search
                        .trim()
                        .toUpperCase(),

                data:
                    data

            });

        }

        catch (error) {

            console.error(
                "Stock Search Error:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);

// ============================================================
// ANGEL ONE STOCK LTP
// ============================================================

app.get(
    "/api/stocks/ltp",
    async (req, res) => {

        try {

            const symbol =
                req.query.symbol;

            const token =
                req.query.token;

            const exchange =
                req.query.exchange ||
                "NSE";

            if (!symbol) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Stock symbol is required."

                });

            }

            if (!token) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Angel One symbol token is required."

                });

            }

            const data =
                await getStockLTP(

                    exchange,

                    symbol,

                    token

                );

            res.json({

                success: true,

                exchange:
                    exchange
                        .trim()
                        .toUpperCase(),

                symbol:
                    symbol
                        .trim()
                        .toUpperCase(),

                token:
                    token,

                data:
                    data

            });

        }

        catch (error) {

            console.error(
                "Stock LTP Error:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);

// ============================================================
// ANGEL ONE MARKET DATA
// ============================================================

app.post(
    "/api/stocks/market-data",
    async (req, res) => {

        try {

            const {

                mode = "FULL",

                exchangeTokens

            } = req.body;

            if (!exchangeTokens) {

                return res.status(400).json({

                    success: false,

                    error:
                        "exchangeTokens are required."

                });

            }

            const data =
                await getMarketData(

                    mode,

                    exchangeTokens

                );

            res.json({

                success: true,

                data:
                    data

            });

        }

        catch (error) {

            console.error(
                "Market Data Error:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);

// ============================================================
// ANGEL ONE HISTORICAL CANDLES
// ============================================================

app.get(
    "/api/stocks/candles",
    async (req, res) => {

        try {

            const {

                exchange = "NSE",

                token,

                interval = "ONE_DAY",

                from,

                to

            } = req.query;

            if (!token) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Symbol token is required."

                });

            }

            if (!from || !to) {

                return res.status(400).json({

                    success: false,

                    error:
                        "from and to dates are required."

                });

            }

            const data =
                await getCandleData(

                    exchange,

                    token,

                    interval,

                    from,

                    to

                );

            res.json({

                success: true,

                data:
                    data

            });

        }

        catch (error) {

            console.error(
                "Candle Data Error:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);

// ============================================================
// START SERVER
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            "================================================"
        );

        console.log(
            "Investopia TradeAI Backend"
        );

        console.log(
            `Server running at http://localhost:${PORT}`
        );

        console.log(
            "Market Data Provider: Angel One SmartAPI"
        );

        console.log(
            "AI Provider: OpenRouter"
        );

        console.log(
            "================================================"
        );

    }
);