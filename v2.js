const OWNER = "Belgium333";
const MODS = ["vsstudiodev", "50free100free200free4"];

let mutedPlayers = {};

function isOwner(playerId) {
    return api.getEntityName(playerId).toLowerCase() === OWNER.toLowerCase();
}

function isMod(playerId) {
    const name = api.getEntityName(playerId).toLowerCase();
    return isOwner(playerId) || MODS.some(mod => mod.toLowerCase() === name);
}

function findPlayer(name) {
    const players = api.getPlayerIds();

    for (const playerId of players) {
        if (api.getEntityName(playerId).toLowerCase() === name.toLowerCase()) {
            return playerId;
        }
    }

    return null;
}

onPlayerChat = (playerId, chatMessage) => {
    const args = chatMessage.trim().split(" ");
    const command = args[0].toLowerCase();

    if (mutedPlayers[playerId] && !isMod(playerId)) {
        api.sendMessage(playerId, "You are muted.", {
            color: "red"
        });
        return false;
    }

    if (!command.startsWith("!")) {
        return;
    }

    if (command === "!help") {
        api.sendMessage(playerId, "===== MOD COMMANDS =====", {
            color: "gold",
            fontWeight: "bold"
        });

        api.sendMessage(playerId, "!help - Show commands");
        api.sendMessage(playerId, "!online - Show players online");

        if (isMod(playerId)) {
            api.sendMessage(playerId, "!kick <player> [reason]");
            api.sendMessage(playerId, "!tp <player>");
            api.sendMessage(playerId, "!bring <player>");
            api.sendMessage(playerId, "!mute <player>");
            api.sendMessage(playerId, "!unmute <player>");
        }

        return false;
    }

    if (command === "!online") {
        const players = api.getPlayerIds();
        const names = players.map(id => api.getEntityName(id));

        api.sendMessage(
            playerId,
            `Players Online (${names.length}): ${names.join(", ")}`,
            {
                color: "white"
            }
        );

        return false;
    }

    if (!isMod(playerId)) {
        api.sendMessage(
            playerId,
            "AY! Stap right there man no hackning -Andrew",
            {
                color: "red"
            }
        );
        return false;
    }

    if (command === "!kick") {
        if (!args[1]) {
            api.sendMessage(playerId, "Usage: !kick <player> [reason]", {
                color: "yellow"
            });
            return false;
        }

        const target = findPlayer(args[1]);

        if (!target) {
            api.sendMessage(playerId, "Player not found.", {
                color: "red"
            });
            return false;
        }

        if (isOwner(target)) {
            api.sendMessage(playerId, "You cannot kick the owner.", {
                color: "red"
            });
            return false;
        }

        const reason = args.slice(2).join(" ") || "Kicked by a moderator";
        const targetName = api.getEntityName(target);

        api.kickPlayer(target, reason);

        api.sendMessage(playerId, `Kicked ${targetName}.`, {
            color: "orange"
        });

        return false;
    }

    if (command === "!tp") {
        if (!args[1]) {
            api.sendMessage(playerId, "Usage: !tp <player>", {
                color: "yellow"
            });
            return false;
        }

        const target = findPlayer(args[1]);

        if (!target) {
            api.sendMessage(playerId, "Player not found.", {
                color: "red"
            });
            return false;
        }

        api.setPosition(playerId, api.getPosition(target));

        return false;
    }

    if (command === "!bring") {
        if (!args[1]) {
            api.sendMessage(playerId, "Usage: !bring <player>", {
                color: "yellow"
            });
            return false;
        }

        const target = findPlayer(args[1]);

        if (!target) {
            api.sendMessage(playerId, "Player not found.", {
                color: "red"
            });
            return false;
        }

        if (isOwner(target) && !isOwner(playerId)) {
            api.sendMessage(playerId, "You cannot bring the owner.", {
                color: "red"
            });
            return false;
        }

        api.setPosition(target, api.getPosition(playerId));

        api.sendMessage(
            playerId,
            `Brought ${api.getEntityName(target)}.`,
            {
                color: "lime"
            }
        );

        return false;
    }

    if (command === "!mute") {
        if (!args[1]) {
            api.sendMessage(playerId, "Usage: !mute <player>", {
                color: "yellow"
            });
            return false;
        }

        const target = findPlayer(args[1]);

        if (!target) {
            api.sendMessage(playerId, "Player not found.", {
                color: "red"
            });
            return false;
        }

        if (isOwner(target)) {
            api.sendMessage(playerId, "You cannot mute the owner.", {
                color: "red"
            });
            return false;
        }

        mutedPlayers[target] = true;

        api.sendMessage(
            playerId,
            `${api.getEntityName(target)} has been muted.`,
            {
                color: "orange"
            }
        );

        api.sendMessage(
            target,
            "You have been muted by a moderator.",
            {
                color: "red"
            }
        );

        return false;
    }

    if (command === "!unmute") {
        if (!args[1]) {
            api.sendMessage(playerId, "Usage: !unmute <player>", {
                color: "yellow"
            });
            return false;
        }

        const target = findPlayer(args[1]);

        if (!target) {
            api.sendMessage(playerId, "Player not found.", {
                color: "red"
            });
            return false;
        }

        delete mutedPlayers[target];

        api.sendMessage(
            playerId,
            `${api.getEntityName(target)} has been unmuted.`,
            {
                color: "lime"
            }
        );

        api.sendMessage(
            target,
            "You have been unmuted.",
            {
                color: "lime"
            }
        );

        return false;
    }
};

onPlayerKilledOtherPlayer = (
    attackingPlayer,
    killedPlayer,
    damageDealt,
    withItem
) => {
    return "keepInventory";
};

onPlayerJoin = (playerId) => {
    const username = api.getEntityName(playerId);

    api.sendTopRightHelper(
        playerId,
        "crown",
        `Welcome back, ${username}!`,
        {
            duration: 10,
            width: 350,
            height: 90,
            color: "rgb(0, 0, 0)",
            iconSizeMult: 2,
            textAndIconColor: "white",
            fontSize: "20px"
        }
    );

    api.queueMiddleTextLower(
        playerId,
        [
            {
                str: "- 👑 Andrew welcomes you!!!!",
                style: {
                    color: "white",
                    fontSize: "14px"
                }
            }
        ],
        10000
    );

    if (isOwner(playerId)) {
        api.setTargetedPlayerSettingForEveryone(
            playerId,
            "nameTagInfo",
            {
                content: [
                    {
                        str: "♛ ",
                        style: {
                            color: "gold",
                            fontSize: "18px",
                            fontWeight: "bold"
                        }
                    },
                    {
                        str: username,
                        style: {
                            color: "white",
                            fontSize: "18px",
                            fontWeight: "bold"
                        }
                    }
                ]
            },
            true
        );
    }

    auctionOnJoin(playerId);
    stockMarketOnJoin(playerId);
};

playerCommand = (playerId, command) => {
    const cmd = command
        .toLowerCase()
        .trim()
        .replace(/^\/+/, "");

    if (
        cmd === "backup" ||
        cmd === "b" ||
        cmd === "server" ||
        cmd === "server switch"
    ) {
        api.sendMessage(
            playerId,
            "Switching to backup server...",
            {
                color: "gold"
            }
        );

        api.matchmakePlayer(
            playerId,
            "classic_survival",
            "hs/ms2"
        );

        return true;
    }

    if (
        cmd === "points" ||
        cmd === "balance"
    ) {
        stockShowPoints(playerId);
        return true;
    }

    if (
        cmd.startsWith("convert ")
    ) {
        const amount =
            cmd.substring(9).trim();

        stockConvertPointsToDiamonds(
            playerId,
            amount
        );

        return true;
    }

    const stockResult =
        stockMarketHandleCommand(
            playerId,
            command
        );

    if (stockResult === true) {
        return true;
    }

    const auctionResult =
        auctionHandleCommand(
            playerId,
            command
        );

    if (auctionResult === true) {
        return true;
    }

    return;
};

const AH_CATEGORY = "ANDREW_AUCTION_HOUSE";
const AH_DATA_KEY = "andrew_auction_house_v2";
const AH_BALANCE_KEY = "andrew_auction_coins_v2";
const AH_STARTING_BALANCE = 500;
const AH_DURATION = 5 * 60 * 1000;
const AH_MAX_LISTINGS = 30;
const AH_MIN_INCREMENT = 1;

let auctionLoaded = false;
let auctionShopInitialized = false;
let auctionShopKeys = {};

let auctionState = {
    nextId: 1,
    listings: {},
    pendingItems: {},
    pendingMoney: {}
};

function auctionLoad() {
    if (auctionLoaded) {
        return;
    }

    const saved = api.getLobbyDbValue(AH_DATA_KEY);

    if (
        saved !== null &&
        saved !== undefined &&
        saved !== ""
    ) {
        try {
            const parsed = JSON.parse(String(saved));

            if (
                parsed &&
                typeof parsed === "object"
            ) {
                auctionState = parsed;
            }
        } catch (e) {}
    }

    if (!auctionState.nextId) {
        auctionState.nextId = 1;
    }

    if (!auctionState.listings) {
        auctionState.listings = {};
    }

    if (!auctionState.pendingItems) {
        auctionState.pendingItems = {};
    }

    if (!auctionState.pendingMoney) {
        auctionState.pendingMoney = {};
    }

    auctionLoaded = true;
}

function auctionSave() {
    auctionLoad();

    api.setLobbyDbValue(
        AH_DATA_KEY,
        JSON.stringify(auctionState)
    );
}

function auctionGetBalance(playerId) {
    let value =
        api.getPlayerDbValue(
            playerId,
            AH_BALANCE_KEY
        );

    if (
        value === null ||
        value === undefined
    ) {
        value = AH_STARTING_BALANCE;

        api.setPlayerDbValue(
            playerId,
            AH_BALANCE_KEY,
            value
        );
    }

    value = Number(value);

    if (
        !Number.isFinite(value) ||
        value < 0
    ) {
        value = 0;

        api.setPlayerDbValue(
            playerId,
            AH_BALANCE_KEY,
            value
        );
    }

    return Math.floor(value);
}

function auctionSetBalance(
    playerId,
    amount
) {
    amount = Math.max(
        0,
        Math.floor(
            Number(amount) || 0
        )
    );

    api.setPlayerDbValue(
        playerId,
        AH_BALANCE_KEY,
        amount
    );
}

function auctionAddMoneyByDbId(
    dbId,
    amount
) {
    dbId = String(dbId);
    amount = Math.floor(
        Number(amount) || 0
    );

    if (amount <= 0) {
        return;
    }

    const playerId =
        api.getPlayerIdFromDbId(
            dbId
        );

    if (playerId) {
        auctionSetBalance(
            playerId,
            auctionGetBalance(
                playerId
            ) + amount
        );
    } else {
        auctionState.pendingMoney[dbId] =
            Number(
                auctionState.pendingMoney[dbId] || 0
            ) + amount;
    }
}

function auctionAddItemByDbId(
    dbId,
    item
) {
    dbId = String(dbId);

    if (
        !item ||
        !item.name
    ) {
        return;
    }

    const amount =
        item.amount === null ||
        item.amount === undefined
            ? 1
            : item.amount;

    if (amount <= 0) {
        return;
    }

    const playerId =
        api.getPlayerIdFromDbId(
            dbId
        );

    if (playerId) {
        const added =
            api.giveItem(
                playerId,
                item.name,
                amount,
                item.attributes
            );

        const remaining =
            amount - added;

        if (remaining > 0) {
            if (
                !auctionState.pendingItems[dbId]
            ) {
                auctionState.pendingItems[dbId] = [];
            }

            auctionState.pendingItems[dbId].push({
                name: item.name,
                amount: remaining,
                attributes: item.attributes
            });
        }
    } else {
        if (
            !auctionState.pendingItems[dbId]
        ) {
            auctionState.pendingItems[dbId] = [];
        }

        auctionState.pendingItems[dbId].push({
            name: item.name,
            amount: amount,
            attributes: item.attributes
        });
    }
}

function auctionClaimPending(
    playerId
) {
    auctionLoad();

    const dbId =
        String(
            api.getPlayerDbId(
                playerId
            )
        );

    const pendingMoney =
        Number(
            auctionState.pendingMoney[dbId] || 0
        );

    if (pendingMoney > 0) {
        auctionSetBalance(
            playerId,
            auctionGetBalance(
                playerId
            ) + pendingMoney
        );

        delete auctionState.pendingMoney[dbId];

        api.sendMessage(
            playerId,
            `Auction House: You received ${pendingMoney} coins.`,
            {
                color: "lime"
            }
        );
    }

    const pendingItems =
        auctionState.pendingItems[dbId] || [];

    const remainingItems = [];

    for (
        const item of pendingItems
    ) {
        if (
            !item ||
            !item.name ||
            !item.amount ||
            item.amount <= 0
        ) {
            continue;
        }

        const added =
            api.giveItem(
                playerId,
                item.name,
                item.amount,
                item.attributes
            );

        const remaining =
            item.amount - added;

        if (remaining > 0) {
            remainingItems.push({
                name: item.name,
                amount: remaining,
                attributes: item.attributes
            });
        }
    }

    if (
        remainingItems.length > 0
    ) {
        auctionState.pendingItems[dbId] =
            remainingItems;
    } else {
        delete auctionState.pendingItems[dbId];
    }

    auctionSave();
}

function auctionFormatTime(ms) {
    const seconds =
        Math.max(
            0,
            Math.ceil(ms / 1000)
        );

    const minutes =
        Math.floor(
            seconds / 60
        );

    const remainingSeconds =
        seconds % 60;

    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }

    return `${remainingSeconds}s`;
}

function auctionListingCount() {
    auctionLoad();

    return Object.keys(
        auctionState.listings
    ).length;
}

function auctionMinimumBid(
    listing
) {
    if (
        listing.currentBid > 0
    ) {
        return (
            listing.currentBid +
            Math.max(
                AH_MIN_INCREMENT,
                Math.ceil(
                    listing.currentBid * 0.05
                )
            )
        );
    }

    return listing.startingPrice;
}

function auctionCreateShopItem(
    listing
) {
    const key =
        `auction_${listing.id}`;

    const minimumBid =
        auctionMinimumBid(
            listing
        );

    api.createShopItem(
        AH_CATEGORY,
        key,
        {
            image:
                "fa-solid fa-gavel",
            cost: 0,
            canBuy: true,
            buyButtonText:
                "PLACE BID",
            customTitle:
                `#${listing.id} • ${listing.item.name}`,
            description:
                `Seller: ${listing.sellerName}\n` +
                `Amount: ${listing.item.amount}\n` +
                `Current bid: ${
                    listing.currentBid ||
                    listing.startingPrice
                } coins\n` +
                `Minimum bid: ${minimumBid} coins\n` +
                `Time left: ${
                    auctionFormatTime(
                        listing.endAt -
                        api.now()
                    )
                }`,
            userInput: {
                type: "number",
                placeholderText:
                    "Enter bid",
                initialValue:
                    String(minimumBid)
            },
            sortPriority:
                1000 -
                listing.id
        }
    );

    auctionShopKeys[key] =
        true;
}

function auctionUpdateShopItem(
    listing
) {
    const key =
        `auction_${listing.id}`;

    const minimumBid =
        auctionMinimumBid(
            listing
        );

    try {
        api.updateShopItem(
            AH_CATEGORY,
            key,
            {
                customTitle:
                    `#${listing.id} • ${listing.item.name}`,
                description:
                    `Seller: ${listing.sellerName}\n` +
                    `Amount: ${listing.item.amount}\n` +
                    `Current bid: ${
                        listing.currentBid ||
                        listing.startingPrice
                    } coins\n` +
                    `Minimum bid: ${minimumBid} coins\n` +
                    `Time left: ${
                        auctionFormatTime(
                            listing.endAt -
                            api.now()
                        )
                    }`,
                userInput: {
                    type: "number",
                    placeholderText:
                        "Enter bid",
                    initialValue:
                        String(minimumBid)
                }
            }
        );
    } catch (e) {
        auctionCreateShopItem(
            listing
        );
    }
}

function auctionEnsureShop() {
    auctionLoad();

    if (
        !auctionShopInitialized
    ) {
        api.configureShopCategory(
            AH_CATEGORY,
            {
                customTitle:
                    "AUCTION HOUSE (Coded by Andrew)",
                description:
                    "Player auctions, live bids, and item trading.",
                sortPriority: 1000
            }
        );

        api.createShopItem(
            AH_CATEGORY,
            "auction_sell_item",
            {
                image:
                    "fa-solid fa-box",
                cost: 0,
                canBuy: true,
                buyButtonText:
                    "LIST ITEM",
                customTitle:
                    "📦 LIST HELD ITEM",
                description:
                    "Hold the item you want to sell and enter your starting price.",
                userInput: {
                    type: "number",
                    placeholderText:
                        "Starting price",
                    initialValue: "100"
                },
                sortPriority:
                    9999
            }
        );

        api.createShopItem(
            AH_CATEGORY,
            "auction_balance",
            {
                image:
                    "Gold Bar",
                cost: 0,
                canBuy: true,
                buyButtonText:
                    "CHECK",
                customTitle:
                    "💰 AUCTION BALANCE",
                description:
                    "Check your current auction coins.",
                sortPriority:
                    9998
            }
        );

        auctionShopInitialized =
            true;
    }

    for (
        const id in
        auctionState.listings
    ) {
        const listing =
            auctionState.listings[
                id
            ];

        const key =
            `auction_${listing.id}`;

        if (
            auctionShopKeys[key]
        ) {
            auctionUpdateShopItem(
                listing
            );
        } else {
            auctionCreateShopItem(
                listing
            );
        }
    }
}

function auctionOpen(
    playerId
) {
    auctionEnsureShop();

    api.openShop(
        playerId,
        false,
        AH_CATEGORY,
        false
    );
}

function auctionListHeldItem(
    playerId,
    price
) {
    auctionLoad();

    price = Math.floor(
        Number(price)
    );

    if (
        !Number.isFinite(price) ||
        price < 1
    ) {
        api.sendMessage(
            playerId,
            "Auction House: Starting price must be at least 1 coin.",
            {
                color: "red"
            }
        );
        return;
    }

    if (
        auctionListingCount() >=
        AH_MAX_LISTINGS
    ) {
        api.sendMessage(
            playerId,
            "Auction House: The auction house is full.",
            {
                color: "red"
            }
        );
        return;
    }

    const selectedSlot =
        api.getSelectedInventorySlotI(
            playerId
        );

    const item =
        api.getItemSlot(
            playerId,
            selectedSlot
        );

    if (
        !item ||
        !item.name
    ) {
        api.sendMessage(
            playerId,
            "Auction House: Hold the item you want to sell first.",
            {
                color: "red"
            }
        );
        return;
    }

    const amount =
        item.amount === null ||
        item.amount === undefined
            ? 1
            : item.amount;

    if (amount <= 0) {
        api.sendMessage(
            playerId,
            "Auction House: That item cannot be auctioned.",
            {
                color: "red"
            }
        );
        return;
    }

    const listing = {
        id:
            auctionState.nextId++,
        sellerDbId:
            String(
                api.getPlayerDbId(
                    playerId
                )
            ),
        sellerName:
            api.getEntityName(
                playerId
            ),
        item: {
            name: item.name,
            amount: amount,
            attributes: item.attributes
        },
        startingPrice:
            price,
        currentBid: 0,
        currentBidderDbId:
            null,
        currentBidderName:
            null,
        endAt:
            api.now() +
            AH_DURATION
    };

    api.setItemSlot(
        playerId,
        selectedSlot,
        "Air",
        null,
        undefined,
        true
    );

    auctionState.listings[
        String(listing.id)
    ] = listing;

    auctionSave();
    auctionEnsureShop();

    api.sendMessage(
        playerId,
        `Auction House: Listed ${amount}x ${item.name} for ${price} coins.`,
        {
            color: "lime"
        }
    );

    api.sendMessage(
        playerId,
        `Auction ID: #${listing.id}`,
        {
            color: "yellow"
        }
    );
}

function auctionPlaceBid(
    playerId,
    listingId,
    bidAmount
) {
    auctionLoad();

    const listing =
        auctionState.listings[
            String(listingId)
        ];

    if (!listing) {
        api.sendOverShopInfo(
            playerId,
            "Auction not found."
        );
        return;
    }

    if (
        listing.endAt <=
        api.now()
    ) {
        auctionFinishListing(
            listing
        );

        api.sendOverShopInfo(
            playerId,
            "Auction has ended."
        );
        return;
    }

    const bidderDbId =
        String(
            api.getPlayerDbId(
                playerId
            )
        );

    if (
        bidderDbId ===
        String(
            listing.sellerDbId
        )
    ) {
        api.sendOverShopInfo(
            playerId,
            "You cannot bid on your own auction."
        );
        return;
    }

    bidAmount = Math.floor(
        Number(bidAmount)
    );

    const minimumBid =
        auctionMinimumBid(
            listing
        );

    if (
        !Number.isFinite(
            bidAmount
        ) ||
        bidAmount <
        minimumBid
    ) {
        api.sendOverShopInfo(
            playerId,
            `Minimum bid: ${minimumBid} coins.`
        );
        return;
    }

    const balance =
        auctionGetBalance(
            playerId
        );

    if (
        balance <
        bidAmount
    ) {
        api.sendOverShopInfo(
            playerId,
            `You need ${bidAmount} coins. You have ${balance}.`
        );
        return;
    }

    auctionSetBalance(
        playerId,
        balance -
        bidAmount
    );

    if (
        listing.currentBidderDbId
    ) {
        auctionAddMoneyByDbId(
            listing.currentBidderDbId,
            listing.currentBid
        );

        const oldBidder =
            api.getPlayerIdFromDbId(
                String(
                    listing.currentBidderDbId
                )
            );

        if (oldBidder) {
            api.sendMessage(
                oldBidder,
                `You were outbid on auction #${listing.id}. Your ${listing.currentBid} coins were refunded.`,
                {
                    color: "orange"
                }
            );
        }
    }

    listing.currentBid =
        bidAmount;

    listing.currentBidderDbId =
        bidderDbId;

    listing.currentBidderName =
        api.getEntityName(
            playerId
        );

    auctionSave();
    auctionUpdateShopItem(
        listing
    );

    api.sendOverShopInfo(
        playerId,
        `Bid placed: ${bidAmount} coins`
    );

    const seller =
        api.getPlayerIdFromDbId(
            String(
                listing.sellerDbId
            )
        );

    if (seller) {
        api.sendMessage(
            seller,
            `Auction #${listing.id} received a ${bidAmount} coin bid from ${api.getEntityName(playerId)}.`,
            {
                color: "yellow"
            }
        );
    }
}

function auctionFinishListing(
    listing
) {
    auctionLoad();

    const key =
        String(listing.id);

    if (
        !auctionState.listings[key]
    ) {
        return;
    }

    delete auctionState.listings[
        key
    ];

    const shopKey =
        `auction_${listing.id}`;

    if (
        auctionShopKeys[
            shopKey
        ]
    ) {
        try {
            api.deleteShopItem(
                AH_CATEGORY,
                shopKey
            );
        } catch (e) {}

        delete auctionShopKeys[
            shopKey
        ];
    }

    if (
        listing.currentBidderDbId &&
        listing.currentBid > 0
    ) {
        auctionAddItemByDbId(
            listing.currentBidderDbId,
            listing.item
        );

        auctionAddMoneyByDbId(
            listing.sellerDbId,
            listing.currentBid
        );

        const winner =
            api.getPlayerIdFromDbId(
                String(
                    listing.currentBidderDbId
                )
            );

        if (winner) {
            api.sendMessage(
                winner,
                `🏆 You won auction #${listing.id} for ${listing.currentBid} coins!`,
                {
                    color: "lime",
                    fontWeight: "bold"
                }
            );
        }

        const seller =
            api.getPlayerIdFromDbId(
                String(
                    listing.sellerDbId
                )
            );

        if (seller) {
            api.sendMessage(
                seller,
                `🏆 Your auction #${listing.id} sold for ${listing.currentBid} coins!`,
                {
                    color: "lime",
                    fontWeight: "bold"
                }
            );
        }
    } else {
        auctionAddItemByDbId(
            listing.sellerDbId,
            listing.item
        );

        const seller =
            api.getPlayerIdFromDbId(
                String(
                    listing.sellerDbId
                )
            );

        if (seller) {
            api.sendMessage(
                seller,
                `Auction #${listing.id} ended with no bids. Your item was returned.`,
                {
                    color: "yellow"
                }
            );
        }
    }

    auctionSave();
}

function auctionCancel(
    playerId,
    listingId
) {
    auctionLoad();

    const listing =
        auctionState.listings[
            String(listingId)
        ];

    if (!listing) {
        api.sendMessage(
            playerId,
            "Auction House: Listing not found.",
            {
                color: "red"
            }
        );
        return;
    }

    const dbId =
        String(
            api.getPlayerDbId(
                playerId
            )
        );

    if (
        dbId !==
        String(
            listing.sellerDbId
        )
    ) {
        api.sendMessage(
            playerId,
            "Auction House: You can only cancel your own listing.",
            {
                color: "red"
            }
        );
        return;
    }

    if (
        listing.currentBid > 0
    ) {
        api.sendMessage(
            playerId,
            "Auction House: You cannot cancel after someone has bid.",
            {
                color: "red"
            }
        );
        return;
    }

    auctionAddItemByDbId(
        listing.sellerDbId,
        listing.item
    );

    delete auctionState.listings[
        String(listingId)
    ];

    const shopKey =
        `auction_${listingId}`;

    if (
        auctionShopKeys[
            shopKey
        ]
    ) {
        try {
            api.deleteShopItem(
                AH_CATEGORY,
                shopKey
            );
        } catch (e) {}

        delete auctionShopKeys[
            shopKey
        ];
    }

    auctionSave();

    api.sendMessage(
        playerId,
        `Auction #${listingId} cancelled. Your item was returned.`,
        {
            color: "yellow"
        }
    );
}

function auctionBalance(
    playerId
) {
    const balance =
        auctionGetBalance(
            playerId
        );

    api.sendMessage(
        playerId,
        `💰 Auction Points: ${balance}`,
        {
            color: "gold",
            fontWeight: "bold"
        }
    );
}

function auctionMyListings(
    playerId
) {
    auctionLoad();

    const dbId =
        String(
            api.getPlayerDbId(
                playerId
            )
        );

    const listings = [];

    for (
        const id in
        auctionState.listings
    ) {
        const listing =
            auctionState.listings[
                id
            ];

        if (
            String(
                listing.sellerDbId
            ) === dbId
        ) {
            listings.push(
                listing
            );
        }
    }

    if (
        listings.length === 0
    ) {
        api.sendMessage(
            playerId,
            "Auction House: You have no active auctions.",
            {
                color: "yellow"
            }
        );
        return;
    }

    api.sendMessage(
        playerId,
        "===== YOUR AUCTIONS =====",
        {
            color: "gold",
            fontWeight: "bold"
        }
    );

    for (
        const listing of
        listings
    ) {
        api.sendMessage(
            playerId,
            `#${listing.id} | ${listing.item.amount}x ${listing.item.name} | ${listing.currentBid || listing.startingPrice} Points | ${auctionFormatTime(listing.endAt - api.now())}`
        );
    }
}

function auctionHelp(
    playerId
) {
    api.sendMessage(
        playerId,
        "===== AUCTION HOUSE =====",
        {
            color: "gold",
            fontWeight: "bold"
        }
    );

    api.sendMessage(
        playerId,
        "/auction or /a - Open auction house"
    );

    api.sendMessage(
        playerId,
        "/auction sell <price> - Sell held item"
    );

    api.sendMessage(
        playerId,
        "/auction balance - Check Points"
    );

    api.sendMessage(
        playerId,
        "/auction my - View your auctions"
    );

    api.sendMessage(
        playerId,
        "/auction cancel <id> - Cancel a no-bid auction"
    );

    api.sendMessage(
        playerId,
        "/auction claim - Claim pending rewards"
    );

    api.sendMessage(
        playerId,
        "/auction convert <diamonds> - Convert Points to Diamonds"
    );
}

function auctionHandleCommand(
    playerId,
    command
) {
    const raw =
        command
            .toLowerCase()
            .trim()
            .replace(/^\/+/, "");

    const args =
        raw.split(/\s+/);

    const cmd =
        args[0];

    if (
        cmd !== "auction" &&
        cmd !== "a"
    ) {
        return;
    }

    if (!args[1]) {
        auctionOpen(
            playerId
        );
        return true;
    }

    const sub =
        args[1];

    if (sub === "help") {
        auctionHelp(
            playerId
        );
        return true;
    }

    if (
        sub === "balance"
    ) {
        auctionBalance(
            playerId
        );
        return true;
    }

    if (
        sub === "my"
    ) {
        auctionMyListings(
            playerId
        );
        return true;
    }

    if (
        sub === "claim"
    ) {
        auctionClaimPending(
            playerId
        );
        return true;
    }

    if (
        sub === "convert"
    ) {
        stockConvertPointsToDiamonds(
            playerId,
            args[2]
        );
        return true;
    }

    if (
        sub === "sell"
    ) {
        if (!args[2]) {
            api.sendMessage(
                playerId,
                "Usage: /auction sell <price>",
                {
                    color: "yellow"
                }
            );
            return true;
        }

        auctionListHeldItem(
            playerId,
            args[2]
        );

        return true;
    }

    if (
        sub === "cancel"
    ) {
        if (!args[2]) {
            api.sendMessage(
                playerId,
                "Usage: /auction cancel <id>",
                {
                    color: "yellow"
                }
            );
            return true;
        }

        auctionCancel(
            playerId,
            Number(args[2])
        );

        return true;
    }

    auctionOpen(
        playerId
    );

    return true;
}

function auctionOnJoin(
    playerId
) {
    auctionLoad();
    auctionGetBalance(
        playerId
    );
    auctionClaimPending(
        playerId
    );
    auctionEnsureShop();
}

function auctionOnBoughtShopItem(
    playerId,
    categoryKey,
    itemKey,
    item,
    userInput
) {
    if (
        categoryKey !==
        AH_CATEGORY
    ) {
        return;
    }

    if (
        itemKey ===
        "auction_sell_item"
    ) {
        auctionListHeldItem(
            playerId,
            userInput
        );
        return;
    }

    if (
        itemKey ===
        "auction_balance"
    ) {
        auctionBalance(
            playerId
        );
        return;
    }

    if (
        itemKey.startsWith(
            "auction_"
        )
    ) {
        const id =
            itemKey.substring(
                "auction_".length
            );

        auctionPlaceBid(
            playerId,
            Number(id),
            userInput
        );
    }
}

let auctionTickTime = 0;

function auctionTick(
    ms
) {
    auctionTickTime += ms;

    if (
        auctionTickTime < 1000
    ) {
        return;
    }

    auctionTickTime = 0;

    auctionLoad();

    let changed = false;

    for (
        const id in
        auctionState.listings
    ) {
        const listing =
            auctionState.listings[
                id
            ];

        if (
            listing.endAt <=
            api.now()
        ) {
            auctionFinishListing(
                listing
            );

            changed = true;
        } else {
            auctionUpdateShopItem(
                listing
            );
        }
    }

    if (changed) {
        auctionSave();
    }
}

const STOCK_CATEGORY =
    "ANDREW_STOCK_MARKET";

const STOCK_DATA_KEY =
    "andrew_stock_market_v1";

const STOCK_PORTFOLIO_KEY =
    "andrew_stock_portfolio_v1";

const STOCK_POINTS_KEY =
    "andrew_auction_coins_v2";

const STOCK_STARTING_POINTS =
    0;

const POINTS_PER_DIAMOND =
    100;

const STOCKS = {
    AEN: {
        name: "Andrew Coding Company",
        sector: "Energy",
        price: 125,
        volatility: 0.009,
        beta: 1.1,
        image: "fa-solid fa-bolt"
    },

    BCX: {
        name: "Diamondmart",
        sector: "Technology",
        price: 240,
        volatility: 0.012,
        beta: 1.5,
        image: "fa-solid fa-microchip"
    },

    GFM: {
        name: "Andrew's Shop",
        sector: "Agriculture",
        price: 80,
        volatility: 0.006,
        beta: 0.7,
        image: "fa-solid fa-seedling"
    },

    SKY: {
        name: "Skyline Airways",
        sector: "Transport",
        price: 160,
        volatility: 0.010,
        beta: 1.0,
        image: "fa-solid fa-plane"
    },

    NEX: {
        name: "Nexus Mining",
        sector: "Mining",
        price: 300,
        volatility: 0.014,
        beta: 1.4,
        image: "fa-solid fa-gem"
    },

    RBL: {
        name: "RedBlock Retail",
        sector: "Retail",
        price: 60,
        volatility: 0.007,
        beta: 0.8,
        image: "fa-solid fa-store"
    },

    PIX: {
        name: "Pixel Media",
        sector: "Media",
        price: 110,
        volatility: 0.013,
        beta: 1.2,
        image: "fa-solid fa-film"
    },

    VLT: {
        name: "Vault Security",
        sector: "Security",
        price: 210,
        volatility: 0.006,
        beta: 0.9,
        image: "fa-solid fa-shield-halved"
    },

    ZAP: {
        name: "Zap Motors",
        sector: "Automotive",
        price: 175,
        volatility: 0.017,
        beta: 1.7,
        image: "fa-solid fa-car"
    },

    LUM: {
        name: "Luma Labs",
        sector: "Research",
        price: 420,
        volatility: 0.019,
        beta: 2.0,
        image: "fa-solid fa-flask"
    }
};

let stockMarketLoaded = false;
let stockMarketShopInitialized = false;
let stockMarketTickTimer = 0;
let stockMarketSaveTimer = 0;

let stockMarketState = {
    trend: 0,
    event: "Market Open",
    stocks: {}
};

function stockMarketLoad() {
    if (stockMarketLoaded) {
        return;
    }

    const saved =
        api.getLobbyDbValue(
            STOCK_DATA_KEY
        );

    if (
        saved !== null &&
        saved !== undefined &&
        saved !== ""
    ) {
        try {
            const parsed =
                JSON.parse(
                    String(saved)
                );

            if (
                parsed &&
                typeof parsed === "object"
            ) {
                stockMarketState =
                    parsed;
            }
        } catch (e) {}
    }

    if (
        !stockMarketState.stocks
    ) {
        stockMarketState.stocks = {};
    }

    if (
        !Number.isFinite(
            Number(
                stockMarketState.trend
            )
        )
    ) {
        stockMarketState.trend = 0;
    }

    if (
        !stockMarketState.event
    ) {
        stockMarketState.event =
            "Market Open";
    }

    for (
        const symbol in STOCKS
    ) {
        const info =
            STOCKS[symbol];

        if (
            !stockMarketState.stocks[
                symbol
            ]
        ) {
            stockMarketState.stocks[
                symbol
            ] = {
                price: info.price,
                previousPrice:
                    info.price,
                history:
                    Array(
                        30
                    ).fill(
                        info.price
                    )
            };
        }

        const stock =
            stockMarketState.stocks[
                symbol
            ];

        if (
            !Number.isFinite(
                Number(stock.price)
            )
        ) {
            stock.price =
                info.price;
        }

        if (
            !Array.isArray(
                stock.history
            )
        ) {
            stock.history = [];
        }

        while (
            stock.history.length <
            30
        ) {
            stock.history.unshift(
                stock.price
            );
        }

        if (
            stock.history.length >
            30
        ) {
            stock.history =
                stock.history.slice(
                    -30
                );
        }
    }

    stockMarketLoaded =
        true;
}

function stockMarketSave() {
    stockMarketLoad();

    api.setLobbyDbValue(
        STOCK_DATA_KEY,
        JSON.stringify(
            stockMarketState
        )
    );
}

function stockGetPoints(
    playerId
) {
    let value =
        api.getPlayerDbValue(
            playerId,
            STOCK_POINTS_KEY
        );

    if (
        value === null ||
        value === undefined
    ) {
        value =
            auctionGetBalance(
                playerId
            );

        api.setPlayerDbValue(
            playerId,
            STOCK_POINTS_KEY,
            value
        );
    }

    value = Math.floor(
        Number(value)
    );

    if (
        !Number.isFinite(value) ||
        value < 0
    ) {
        value = 0;

        api.setPlayerDbValue(
            playerId,
            STOCK_POINTS_KEY,
            value
        );
    }

    return value;
}

function stockSetPoints(
    playerId,
    amount
) {
    amount = Math.max(
        0,
        Math.floor(
            Number(amount) || 0
        )
    );

    auctionSetBalance(
        playerId,
        amount
    );
}

function stockGetPortfolio(
    playerId
) {
    let saved =
        api.getPlayerDbValue(
            playerId,
            STOCK_PORTFOLIO_KEY
        );

    let portfolio = {};

    if (
        saved !== null &&
        saved !== undefined &&
        saved !== ""
    ) {
        try {
            portfolio =
                JSON.parse(
                    String(saved)
                );

            if (
                !portfolio ||
                typeof portfolio !==
                "object"
            ) {
                portfolio = {};
            }
        } catch (e) {
            portfolio = {};
        }
    }

    return portfolio;
}

function stockSetPortfolio(
    playerId,
    portfolio
) {
    api.setPlayerDbValue(
        playerId,
        STOCK_PORTFOLIO_KEY,
        JSON.stringify(
            portfolio
        )
    );
}

function stockGetPrice(
    symbol
) {
    stockMarketLoad();

    if (
        !STOCKS[symbol]
    ) {
        return 0;
    }

    return Math.max(
        1,
        Math.floor(
            Number(
                stockMarketState
                    .stocks[symbol]
                    .price
            )
        )
    );
}

function stockGetChange(
    symbol
) {
    stockMarketLoad();

    const stock =
        stockMarketState
            .stocks[symbol];

    if (
        !stock ||
        !stock.previousPrice
    ) {
        return 0;
    }

    return (
        (
            stock.price -
            stock.previousPrice
        ) /
        stock.previousPrice
    ) * 100;
}

function stockGetSparkline(
    symbol
) {
    stockMarketLoad();

    const stock =
        stockMarketState
            .stocks[symbol];

    if (
        !stock ||
        !Array.isArray(
            stock.history
        )
    ) {
        return "────────";
    }

    const values =
        stock.history.slice(
            -24
        );

    if (
        values.length === 0
    ) {
        return "────────";
    }

    let min =
        Infinity;

    let max =
        -Infinity;

    for (
        const value of values
    ) {
        min =
            Math.min(
                min,
                value
            );

        max =
            Math.max(
                max,
                value
            );
    }

    if (
        min === max
    ) {
        return "▄".repeat(
            values.length
        );
    }

    const chars =
        "▁▂▃▄▅▆▇█";

    let result = "";

    for (
        const value of values
    ) {
        const normalized =
            (
                value -
                min
            ) /
            (
                max -
                min
            );

        const index =
            Math.max(
                0,
                Math.min(
                    chars.length - 1,
                    Math.floor(
                        normalized *
                        (
                            chars.length - 1
                        )
                    )
                )
            );

        result +=
            chars[index];
    }

    return result;
}

function stockDirection(
    symbol
) {
    const change =
        stockGetChange(
            symbol
        );

    if (
        change > 0.01
    ) {
        return "▲";
    }

    if (
        change < -0.01
    ) {
        return "▼";
    }

    return "●";
}

function stockDescription(
    symbol
) {
    const info =
        STOCKS[symbol];

    const price =
        stockGetPrice(
            symbol
        );

    const change =
        stockGetChange(
            symbol
        );

    const direction =
        stockDirection(
            symbol
        );

    const changeText =
        change >= 0
            ? `+${change.toFixed(2)}%`
            : `${change.toFixed(2)}%`;

    return (
        `Ticker: ${symbol}\n` +
        `Sector: ${info.sector}\n` +
        `Price: ${price} Points\n` +
        `${direction} ${changeText}\n` +
        `Chart: ${stockGetSparkline(symbol)}\n` +
        `Market: ${stockMarketState.event}`
    );
}

function stockBuy(
    playerId,
    symbol,
    amount
) {
    stockMarketLoad();

    symbol =
        String(symbol)
            .toUpperCase();

    if (
        !STOCKS[symbol]
    ) {
        api.sendMessage(
            playerId,
            "Stock not found.",
            {
                color: "red"
            }
        );
        return;
    }

    amount =
        Math.floor(
            Number(amount)
        );

    if (
        !Number.isFinite(amount) ||
        amount < 1
    ) {
        api.sendMessage(
            playerId,
            "Enter a valid number of shares.",
            {
                color: "yellow"
            }
        );
        return;
    }

    const price =
        stockGetPrice(
            symbol
        );

    const total =
        price * amount;

    const points =
        stockGetPoints(
            playerId
        );

    if (
        points < total
    ) {
        api.sendMessage(
            playerId,
            `You need ${total} Points. You only have ${points}.`,
            {
                color: "red"
            }
        );
        return;
    }

    const portfolio =
        stockGetPortfolio(
            playerId
        );

    if (
        !portfolio[symbol]
    ) {
        portfolio[symbol] = {
            shares: 0,
            costBasis: 0
        };
    }

    portfolio[symbol]
        .shares += amount;

    portfolio[symbol]
        .costBasis += total;

    stockSetPoints(
        playerId,
        points - total
    );

    stockSetPortfolio(
        playerId,
        portfolio
    );

    api.sendOverShopInfo(
        playerId,
        `Bought ${amount} ${symbol} shares for ${total} Points`
    );
}

function stockSell(
    playerId,
    symbol,
    amount
) {
    stockMarketLoad();

    symbol =
        String(symbol)
            .toUpperCase();

    if (
        !STOCKS[symbol]
    ) {
        api.sendMessage(
            playerId,
            "Stock not found.",
            {
                color: "red"
            }
        );
        return;
    }

    amount =
        Math.floor(
            Number(amount)
        );

    if (
        !Number.isFinite(amount) ||
        amount < 1
    ) {
        api.sendMessage(
            playerId,
            "Enter a valid number of shares.",
            {
                color: "yellow"
            }
        );
        return;
    }

    const portfolio =
        stockGetPortfolio(
            playerId
        );

    if (
        !portfolio[symbol] ||
        portfolio[symbol].shares <
        amount
    ) {
        api.sendMessage(
            playerId,
            `You don't own ${amount} shares of ${symbol}.`,
            {
                color: "red"
            }
        );
        return;
    }

    const price =
        stockGetPrice(
            symbol
        );

    const proceeds =
        price * amount;

    const oldShares =
        portfolio[symbol]
            .shares;

    const oldBasis =
        portfolio[symbol]
            .costBasis;

    const averageCost =
        oldShares > 0
            ? oldBasis /
              oldShares
            : 0;

    const removedBasis =
        averageCost *
        amount;

    const profit =
        proceeds -
        removedBasis;

    portfolio[symbol]
        .shares -= amount;

    portfolio[symbol]
        .costBasis =
            Math.max(
                0,
                oldBasis -
                removedBasis
            );

    if (
        portfolio[symbol]
            .shares <= 0
    ) {
        delete portfolio[
            symbol
        ];
    }

    stockSetPortfolio(
        playerId,
        portfolio
    );

    stockSetPoints(
        playerId,
        stockGetPoints(
            playerId
        ) + proceeds
    );

    const profitText =
        profit >= 0
            ? `+${Math.floor(profit)}`
            : `${Math.floor(profit)}`;

    api.sendOverShopInfo(
        playerId,
        `Sold ${amount} ${symbol} for ${proceeds} Points | P/L ${profitText}`
    );
}

function stockShowPoints(
    playerId
) {
    api.sendMessage(
        playerId,
        `💰 Points: ${stockGetPoints(playerId)}`,
        {
            color: "gold",
            fontWeight: "bold"
        }
    );
}

function stockShowPortfolio(
    playerId
) {
    stockMarketLoad();

    const portfolio =
        stockGetPortfolio(
            playerId
        );

    const symbols =
        Object.keys(
            portfolio
        );

    api.sendMessage(
        playerId,
        "===== STOCK PORTFOLIO =====",
        {
            color: "gold",
            fontWeight: "bold"
        }
    );

    if (
        symbols.length === 0
    ) {
        api.sendMessage(
            playerId,
            "You don't own any stocks.",
            {
                color: "white"
            }
        );
        return;
    }

    let totalValue = 0;
    let totalBasis = 0;

    for (
        const symbol of symbols
    ) {
        const holding =
            portfolio[symbol];

        const price =
            stockGetPrice(
                symbol
            );

        const value =
            price *
            holding.shares;

        totalValue += value;
        totalBasis +=
            holding.costBasis;

        const profit =
            value -
            holding.costBasis;

        const profitText =
            profit >= 0
                ? `+${Math.floor(profit)}`
                : `${Math.floor(profit)}`;

        api.sendMessage(
            playerId,
            `${symbol}: ${holding.shares} shares | ${value} Points | P/L ${profitText}`,
            {
                color:
                    profit >= 0
                        ? "lime"
                        : "red"
            }
        );
    }

    api.sendMessage(
        playerId,
        `Stock Value: ${Math.floor(totalValue)} Points`,
        {
            color: "white"
        }
    );

    api.sendMessage(
        playerId,
        `Invested: ${Math.floor(totalBasis)} Points`,
        {
            color: "white"
        }
    );

    api.sendMessage(
        playerId,
        `Cash: ${stockGetPoints(playerId)} Points`,
        {
            color: "gold"
        }
    );
}

function stockConvertPointsToDiamonds(
    playerId,
    diamonds
) {
    diamonds =
        Math.floor(
            Number(diamonds)
        );

    if (
        !Number.isFinite(diamonds) ||
        diamonds < 1
    ) {
        api.sendMessage(
            playerId,
            "Enter the number of Diamonds you want.",
            {
                color: "yellow"
            }
        );
        return;
    }

    const required =
        diamonds *
        POINTS_PER_DIAMOND;

    const points =
        stockGetPoints(
            playerId
        );

    if (
        points < required
    ) {
        api.sendMessage(
            playerId,
            `You need ${required} Points for ${diamonds} Diamond${diamonds === 1 ? "" : "s"}. You have ${points}.`,
            {
                color: "red"
            }
        );
        return;
    }

    const added =
        api.giveItem(
            playerId,
            "Diamond",
            diamonds
        );

    if (
        added <= 0
    ) {
        api.sendMessage(
            playerId,
            "Your inventory is full. No Points were taken.",
            {
                color: "red"
            }
        );
        return;
    }

    stockSetPoints(
        playerId,
        points -
        added *
        POINTS_PER_DIAMOND
    );

    api.sendMessage(
        playerId,
        `Converted ${added * POINTS_PER_DIAMOND} Points into ${added} Diamond${added === 1 ? "" : "s"}.`,
        {
            color: "aqua"
        }
    );
}

function stockMarketEnsureShop() {
    stockMarketLoad();

    if (
        !stockMarketShopInitialized
    ) {
        api.configureShopCategory(
            STOCK_CATEGORY,
            {
                customTitle:
                    "📈 ANDREW STOCK MARKET",
                description:
                    "Live stocks with constantly changing prices.",
                sortPriority:
                    2000
            }
        );

        api.createShopItem(
            STOCK_CATEGORY,
            "stock_overview",
            {
                image:
                    "fa-solid fa-chart-line",
                cost: 0,
                canBuy: true,
                buyButtonText:
                    "VIEW",
                customTitle:
                    "📊 MARKET OVERVIEW",
                description:
                    "Prices update every 2 seconds.",
                sortPriority:
                    99999
            }
        );

        api.createShopItem(
            STOCK_CATEGORY,
            "stock_balance",
            {
                image:
                    "Gold Bar",
                cost: 0,
                canBuy: true,
                buyButtonText:
                    "CHECK",
                customTitle:
                    "💰 YOUR POINTS",
                description:
                    "Your auction and stock market currency.",
                sortPriority:
                    99998
            }
        );

        api.createShopItem(
            STOCK_CATEGORY,
            "stock_portfolio",
            {
                image:
                    "fa-solid fa-briefcase",
                cost: 0,
                canBuy: true,
                buyButtonText:
                    "VIEW",
                customTitle:
                    "💼 MY PORTFOLIO",
                description:
                    "View all your stocks, value, and profit/loss.",
                sortPriority:
                    99997
            }
        );

        api.createShopItem(
            STOCK_CATEGORY,
            "stock_convert",
            {
                image:
                    "Diamond",
                cost: 0,
                canBuy: true,
                buyButtonText:
                    "CONVERT",
                customTitle:
                    "💎 POINTS → DIAMONDS",
                description:
                    "100 Points = 1 Diamond.",
                userInput: {
                    type:
                        "number",
                    placeholderText:
                        "Diamonds",
                    initialValue:
                        "1"
                },
                sortPriority:
                    99996
            }
        );

        let priority =
            9000;

        for (
            const symbol in STOCKS
        ) {
            const info =
                STOCKS[symbol];

            api.createShopItem(
                STOCK_CATEGORY,
                `buy_${symbol}`,
                {
                    image:
                        info.image,
                    cost: 0,
                    canBuy: true,
                    buyButtonText:
                        "BUY",
                    customTitle:
                        `🟢 BUY ${symbol}`,
                    description:
                        stockDescription(
                            symbol
                        ),
                    userInput: {
                        type:
                            "number",
                        placeholderText:
                            "Shares",
                        initialValue:
                            "1"
                    },
                    sortPriority:
                        priority--
                }
            );

            api.createShopItem(
                STOCK_CATEGORY,
                `sell_${symbol}`,
                {
                    image:
                        info.image,
                    cost: 0,
                    canBuy: true,
                    buyButtonText:
                        "SELL",
                    customTitle:
                        `🔴 SELL ${symbol}`,
                    description:
                        stockDescription(
                            symbol
                        ),
                    userInput: {
                        type:
                            "number",
                        placeholderText:
                            "Shares",
                        initialValue:
                            "1"
                    },
                    sortPriority:
                        priority--
                }
            );
        }

        stockMarketShopInitialized =
            true;
    }

    for (
        const symbol in STOCKS
    ) {
        stockMarketUpdateShopItem(
            symbol
        );
    }

    try {
        api.updateShopItem(
            STOCK_CATEGORY,
            "stock_overview",
            {
                description:
                    `Market: ${
                        stockMarketState.trend >= 0
                            ? "BULLISH ▲"
                            : "BEARISH ▼"
                    }\n` +
                    `Event: ${stockMarketState.event}\n` +
                    `Prices update every 2 seconds.\n` +
                    `100 Points = 1 Diamond`
            }
        );
    } catch (e) {}
}

function stockMarketUpdateShopItem(
    symbol
) {
    const info =
        STOCKS[symbol];

    const price =
        stockGetPrice(
            symbol
        );

    const change =
        stockGetChange(
            symbol
        );

    const direction =
        change > 0.01
            ? "▲"
            : change < -0.01
                ? "▼"
                : "●";

    try {
        api.updateShopItem(
            STOCK_CATEGORY,
            `buy_${symbol}`,
            {
                customTitle:
                    `🟢 BUY ${symbol} — ${info.name} — ${direction} ${price} P`,
                description:
                    stockDescription(
                        symbol
                    )
            }
        );

        api.updateShopItem(
            STOCK_CATEGORY,
            `sell_${symbol}`,
            {
                customTitle:
                    `🔴 SELL ${symbol} — ${info.name} — ${direction} ${price} P`,
                description:
                    stockDescription(
                        symbol
                    )
            }
        );
    } catch (e) {}
}

function stockMarketOpen(
    playerId
) {
    stockMarketEnsureShop();

    api.openShop(
        playerId,
        false,
        STOCK_CATEGORY,
        false
    );
}

function stockMarketHandleShopPurchase(
    playerId,
    categoryKey,
    itemKey,
    item,
    userInput
) {
    if (
        categoryKey !==
        STOCK_CATEGORY
    ) {
        return;
    }

    if (
        itemKey ===
        "stock_overview"
    ) {
        api.sendOverShopInfo(
            playerId,
            `${stockMarketState.event} | Prices updating live`
        );
        return;
    }

    if (
        itemKey ===
        "stock_balance"
    ) {
        stockShowPoints(
            playerId
        );
        return;
    }

    if (
        itemKey ===
        "stock_portfolio"
    ) {
        stockShowPortfolio(
            playerId
        );
        return;
    }

    if (
        itemKey ===
        "stock_convert"
    ) {
        stockConvertPointsToDiamonds(
            playerId,
            userInput
        );
        return;
    }

    if (
        itemKey.startsWith(
            "buy_"
        )
    ) {
        stockBuy(
            playerId,
            itemKey.substring(4),
            userInput
        );
        return;
    }

    if (
        itemKey.startsWith(
            "sell_"
        )
    ) {
        stockSell(
            playerId,
            itemKey.substring(5),
            userInput
        );
    }
}

function stockMarketHandleCommand(
    playerId,
    command
) {
    const raw =
        command
            .toLowerCase()
            .trim()
            .replace(/^\/+/, "");

    const args =
        raw.split(/\s+/);

    const root =
        args[0];

    if (
        root !== "stock" &&
        root !== "stocks" &&
        root !== "market" &&
        root !== "m"
    ) {
        return;
    }

    if (
        !args[1]
    ) {
        stockMarketOpen(
            playerId
        );
        return true;
    }

    const sub =
        args[1];

    if (
        sub === "help"
    ) {
        api.sendMessage(
            playerId,
            "===== STOCK MARKET =====",
            {
                color: "gold",
                fontWeight:
                    "bold"
            }
        );

        api.sendMessage(
            playerId,
            "/market - Open stock market"
        );

        api.sendMessage(
            playerId,
            "/stocks buy AEN 5"
        );

        api.sendMessage(
            playerId,
            "/stocks sell AEN 5"
        );

        api.sendMessage(
            playerId,
            "/stocks portfolio"
        );

        api.sendMessage(
            playerId,
            "/stocks balance"
        );

        api.sendMessage(
            playerId,
            "/convert 1 - 100 Points = 1 Diamond"
        );

        return true;
    }

    if (
        sub === "portfolio" ||
        sub === "p"
    ) {
        stockShowPortfolio(
            playerId
        );
        return true;
    }

    if (
        sub === "balance" ||
        sub === "points"
    ) {
        stockShowPoints(
            playerId
        );
        return true;
    }

    if (
        sub === "convert"
    ) {
        stockConvertPointsToDiamonds(
            playerId,
            args[2]
        );
        return true;
    }

    if (
        sub === "buy" &&
        args[2] &&
        args[3]
    ) {
        stockBuy(
            playerId,
            args[2],
            args[3]
        );
        return true;
    }

    if (
        sub === "sell" &&
        args[2] &&
        args[3]
    ) {
        stockSell(
            playerId,
            args[2],
            args[3]
        );
        return true;
    }

    stockMarketOpen(
        playerId
    );

    return true;
}

function stockMarketOnJoin(
    playerId
) {
    stockMarketLoad();

    stockGetPoints(
        playerId
    );

    stockMarketEnsureShop();
}

function stockMarketTick(
    ms
) {
    stockMarketTickTimer +=
        ms;

    stockMarketSaveTimer +=
        ms;

    if (
        stockMarketTickTimer >=
        2000
    ) {
        stockMarketTickTimer =
            0;

        stockMarketLoad();

        stockMarketState.trend +=
            (
                Math.random() -
                0.5
            ) *
            0.001;

        stockMarketState.trend *=
            0.96;

        if (
            Math.random() <
            0.03
        ) {
            const eventRoll =
                Math.random();

            if (
                eventRoll <
                0.33
            ) {
                stockMarketState.event =
                    "Market Boom ▲";

                stockMarketState.trend +=
                    0.018;
            } else if (
                eventRoll <
                0.66
            ) {
                stockMarketState.event =
                    "Market Dip ▼";

                stockMarketState.trend -=
                    0.018;
            } else {
                stockMarketState.event =
                    "Stable Trading ●";
            }
        }

        for (
            const symbol in STOCKS
        ) {
            const info =
                STOCKS[symbol];

            const stock =
                stockMarketState
                    .stocks[symbol];

            stock.previousPrice =
                stock.price;

            const randomMove =
                (
                    Math.random() -
                    0.5
                ) *
                2 *
                info.volatility;

            const trendMove =
                stockMarketState
                    .trend *
                info.beta;

            const move =
                randomMove +
                trendMove;

            stock.price =
                Math.max(
                    1,
                    Math.round(
                        stock.price *
                        Math.exp(
                            move
                        )
                    )
                );

            stock.history.push(
                stock.price
            );

            if (
                stock.history.length >
                30
            ) {
                stock.history.shift();
            }
        }

        stockMarketSave();

        if (
            stockMarketShopInitialized
        ) {
            for (
                const symbol in STOCKS
            ) {
                stockMarketUpdateShopItem(
                    symbol
                );
            }
        }

        try {
            api.updateShopItem(
                STOCK_CATEGORY,
                "stock_overview",
                {
                    description:
                        `Market: ${
                            stockMarketState.trend >= 0
                                ? "BULLISH ▲"
                                : "BEARISH ▼"
                        }\n` +
                        `Event: ${stockMarketState.event}\n` +
                        `Prices update every 2 seconds.\n` +
                        `100 Points = 1 Diamond`
                }
            );
        } catch (e) {}
    }

    if (
        stockMarketSaveTimer >=
        15000
    ) {
        stockMarketSaveTimer =
            0;

        stockMarketSave();
    }
}

tick = (ms) => {
    auctionTick(ms);
    stockMarketTick(ms);
};

onPlayerBoughtShopItem = (
    playerId,
    categoryKey,
    itemKey,
    item,
    userInput
) => {
    auctionOnBoughtShopItem(
        playerId,
        categoryKey,
        itemKey,
        item,
        userInput
    );

    stockMarketHandleShopPurchase(
        playerId,
        categoryKey,
        itemKey,
        item,
        userInput
    );
};

doPeriodicSave = () => {
    if (auctionLoaded) {
        auctionSave();
    }

    if (stockMarketLoaded) {
        stockMarketSave();
    }
};
