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

    return auctionHandleCommand(playerId, command);
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

            if (parsed && typeof parsed === "object") {
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
    let value = api.getPlayerDbValue(
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

function auctionSetBalance(playerId, amount) {
    amount = Math.max(
        0,
        Math.floor(Number(amount) || 0)
    );

    api.setPlayerDbValue(
        playerId,
        AH_BALANCE_KEY,
        amount
    );
}

function auctionAddMoneyByDbId(dbId, amount) {
    dbId = String(dbId);
    amount = Math.floor(Number(amount) || 0);

    if (amount <= 0) {
        return;
    }

    const playerId = api.getPlayerIdFromDbId(dbId);

    if (playerId) {
        auctionSetBalance(
            playerId,
            auctionGetBalance(playerId) + amount
        );
    } else {
        auctionState.pendingMoney[dbId] =
            Number(
                auctionState.pendingMoney[dbId] || 0
            ) + amount;
    }
}

function auctionAddItemByDbId(dbId, item) {
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
        api.getPlayerIdFromDbId(dbId);

    if (playerId) {
        const added = api.giveItem(
            playerId,
            item.name,
            amount,
            item.attributes
        );

        const remaining = amount - added;

        if (remaining > 0) {
            if (!auctionState.pendingItems[dbId]) {
                auctionState.pendingItems[dbId] = [];
            }

            auctionState.pendingItems[dbId].push({
                name: item.name,
                amount: remaining,
                attributes: item.attributes
            });
        }
    } else {
        if (!auctionState.pendingItems[dbId]) {
            auctionState.pendingItems[dbId] = [];
        }

        auctionState.pendingItems[dbId].push({
            name: item.name,
            amount: amount,
            attributes: item.attributes
        });
    }
}

function auctionClaimPending(playerId) {
    auctionLoad();

    const dbId = String(
        api.getPlayerDbId(playerId)
    );

    const pendingMoney = Number(
        auctionState.pendingMoney[dbId] || 0
    );

    if (pendingMoney > 0) {
        auctionSetBalance(
            playerId,
            auctionGetBalance(playerId) + pendingMoney
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

    for (const item of pendingItems) {
        if (
            !item ||
            !item.name ||
            !item.amount ||
            item.amount <= 0
        ) {
            continue;
        }

        const added = api.giveItem(
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

    if (remainingItems.length > 0) {
        auctionState.pendingItems[dbId] =
            remainingItems;
    } else {
        delete auctionState.pendingItems[dbId];
    }

    if (pendingItems.length > 0) {
        api.sendMessage(
            playerId,
            "Auction House: Your pending items have been delivered when space was available.",
            {
                color: "lime"
            }
        );
    }

    auctionSave();
}

function auctionFormatTime(ms) {
    const seconds = Math.max(
        0,
        Math.ceil(ms / 1000)
    );

    const minutes = Math.floor(
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

function auctionMinimumBid(listing) {
    if (listing.currentBid > 0) {
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

function auctionCreateShopItem(listing) {
    const key = `auction_${listing.id}`;
    const minimumBid =
        auctionMinimumBid(listing);

    api.createShopItem(
        AH_CATEGORY,
        key,
        {
            image: "fa-solid fa-gavel",
            cost: 0,
            canBuy: true,
            buyButtonText: "PLACE BID",
            customTitle:
                `#${listing.id} • ${listing.item.name}`,
            description:
                `Seller: ${listing.sellerName}\n` +
                `Amount: ${listing.item.amount}\n` +
                `Current bid: ${
                    listing.currentBid || listing.startingPrice
                } coins\n` +
                `Minimum bid: ${minimumBid} coins\n` +
                `Time left: ${
                    auctionFormatTime(
                        listing.endAt - api.now()
                    )
                }`,
            userInput: {
                type: "number",
                placeholderText: "Enter bid",
                initialValue: String(minimumBid)
            },
            sortPriority:
                1000 - listing.id
        }
    );

    auctionShopKeys[key] = true;
}

function auctionUpdateShopItem(listing) {
    const key = `auction_${listing.id}`;
    const minimumBid =
        auctionMinimumBid(listing);

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
                        listing.currentBid || listing.startingPrice
                    } coins\n` +
                    `Minimum bid: ${minimumBid} coins\n` +
                    `Time left: ${
                        auctionFormatTime(
                            listing.endAt - api.now()
                        )
                    }`,
                userInput: {
                    type: "number",
                    placeholderText: "Enter bid",
                    initialValue: String(minimumBid)
                }
            }
        );
    } catch (e) {
        auctionCreateShopItem(listing);
    }
}

function auctionEnsureShop() {
    auctionLoad();

    if (!auctionShopInitialized) {
        api.configureShopCategory(
            AH_CATEGORY,
            {
                customTitle:
                    "AUCTION HOUSE (Coded by Andrew) ",
                description:
                    "Player auctions, live bids, and item trading.",
                sortPriority: 1000
            }
        );

        api.createShopItem(
            AH_CATEGORY,
            "auction_sell_item",
            {
                image: "fa-solid fa-box",
                cost: 0,
                canBuy: true,
                buyButtonText: "LIST ITEM",
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
                sortPriority: 9999
            }
        );

        api.createShopItem(
            AH_CATEGORY,
            "auction_balance",
            {
                image: "Gold Bar",
                cost: 0,
                canBuy: true,
                buyButtonText: "CHECK",
                customTitle:
                    "💰 AUCTION BALANCE",
                description:
                    "Check your current auction coins.",
                sortPriority: 9998
            }
        );

        auctionShopInitialized = true;
    }

    for (const id in auctionState.listings) {
        const listing =
            auctionState.listings[id];

        const key =
            `auction_${listing.id}`;

        if (auctionShopKeys[key]) {
            auctionUpdateShopItem(listing);
        } else {
            auctionCreateShopItem(listing);
        }
    }
}

function auctionOpen(playerId) {
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
        id: auctionState.nextId++,
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
        startingPrice: price,
        currentBid: 0,
        currentBidderDbId: null,
        currentBidderName: null,
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
        balance - bidAmount
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
        `💰 Auction Coins: ${balance}`,
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
            `#${listing.id} | ${listing.item.amount}x ${listing.item.name} | ${listing.currentBid || listing.startingPrice} coins | ${auctionFormatTime(listing.endAt - api.now())}`
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
        "/auction balance - Check auction coins"
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
        "/auction help - Show help"
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

    if (sub === "my") {
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

    if (sub === "sell") {
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

    if (sub === "cancel") {
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

let auctionSaveTime = 0;

tick = (ms) => {
    auctionTick(ms);

    auctionSaveTime += ms;

    if (
        auctionSaveTime >=
        30000
    ) {
        auctionSaveTime = 0;

        if (auctionLoaded) {
            auctionSave();
        }
    }
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
};

doPeriodicSave = () => {
    if (auctionLoaded) {
        auctionSave();
    }
};
