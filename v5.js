const OWNER = "Belgium333";
const MODS = ["vsstudiodev", "50free100free200free4"];
const CURRENCY_NAME = "Rubel";
const CURRENCY_PER_DIAMOND = 20;
const DIAMONDS_PER_BUNDLE = 5;
const CURRENCY_PER_BUNDLE = CURRENCY_PER_DIAMOND * DIAMONDS_PER_BUNDLE;
const WALLET_KEY = "andrew_auction_coins_v2";

let mutedPlayers = {};

function isOwner(playerId) {
    return api.getEntityName(playerId).toLowerCase() === OWNER.toLowerCase();
}

function isMod(playerId) {
    const name = api.getEntityName(playerId).toLowerCase();
    return isOwner(playerId) || MODS.some(x => x.toLowerCase() === name);
}

function findPlayer(name) {
    const target = String(name).toLowerCase();
    for (const id of api.getPlayerIds()) {
        if (api.getEntityName(id).toLowerCase() === target) return id;
    }
    return null;
}

function money(n) {
    return `${Math.floor(Number(n) || 0).toLocaleString()} ${CURRENCY_NAME}`;
}

function walletGet(playerId) {
    let v = api.getPlayerDbValue(playerId, WALLET_KEY);

    if (v === null || v === undefined || v === "") {
        v = 500;
        api.setPlayerDbValue(playerId, WALLET_KEY, v);
    }

    v = Math.floor(Number(v));

    if (!Number.isFinite(v) || v < 0) {
        v = 0;
        api.setPlayerDbValue(playerId, WALLET_KEY, v);
    }

    return v;
}

function walletSet(playerId, amount) {
    api.setPlayerDbValue(
        playerId,
        WALLET_KEY,
        Math.max(0, Math.floor(Number(amount) || 0))
    );
}

function walletAddDb(dbId, amount) {
    amount = Math.floor(Number(amount) || 0);

    if (amount <= 0) return;

    const id = api.getPlayerIdFromDbId(String(dbId));

    if (id) {
        walletSet(
            id,
            walletGet(id) + amount
        );
    } else {
        auctionLoad();

        const key = String(dbId);

        auctionState.pendingMoney[key] =
            (auctionState.pendingMoney[key] || 0) + amount;

        auctionSave();
    }
}

function showBalance(playerId) {
    api.sendMessage(
        playerId,
        `💰 ${money(walletGet(playerId))}`,
        {
            color: "gold",
            fontWeight: "bold"
        }
    );
}

onPlayerChat = (playerId, chatMessage) => {
    const args = chatMessage.trim().split(/\s+/);
    const command = args[0].toLowerCase();

    if (mutedPlayers[playerId] && !isMod(playerId)) {
        api.sendMessage(
            playerId,
            "You are muted.",
            {
                color: "red"
            }
        );

        return false;
    }

    if (!command.startsWith("!")) {
        return;
    }

    if (command === "!help") {
        api.sendMessage(
            playerId,
            "===== MOD COMMANDS =====",
            {
                color: "gold",
                fontWeight: "bold"
            }
        );

        api.sendMessage(
            playerId,
            "!help - Show commands"
        );

        api.sendMessage(
            playerId,
            "!online - Show players online"
        );

        if (isMod(playerId)) {
            api.sendMessage(
                playerId,
                "!kick <player> [reason]"
            );

            api.sendMessage(
                playerId,
                "!tp <player>"
            );

            api.sendMessage(
                playerId,
                "!bring <player>"
            );

            api.sendMessage(
                playerId,
                "!mute <player>"
            );

            api.sendMessage(
                playerId,
                "!unmute <player>"
            );
        }

        return false;
    }

    if (command === "!online") {
        const names =
            api.getPlayerIds().map(
                id => api.getEntityName(id)
            );

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
            api.sendMessage(
                playerId,
                "!kick <player> [reason]",
                {
                    color: "yellow"
                }
            );

            return false;
        }

        const target =
            findPlayer(args[1]);

        if (!target) {
            api.sendMessage(
                playerId,
                "Player not found.",
                {
                    color: "red"
                }
            );

            return false;
        }

        if (isOwner(target)) {
            api.sendMessage(
                playerId,
                "You cannot kick the owner.",
                {
                    color: "red"
                }
            );

            return false;
        }

        const reason =
            args.slice(2).join(" ") ||
            "Kicked by a moderator";

        api.kickPlayer(
            target,
            reason
        );

        api.sendMessage(
            playerId,
            `Kicked ${api.getEntityName(target)}.`,
            {
                color: "orange"
            }
        );

        return false;
    }

    if (command === "!tp") {
        if (!args[1]) {
            api.sendMessage(
                playerId,
                "!tp <player>",
                {
                    color: "yellow"
                }
            );

            return false;
        }

        const target =
            findPlayer(args[1]);

        if (!target) {
            api.sendMessage(
                playerId,
                "Player not found.",
                {
                    color: "red"
                }
            );

            return false;
        }

        api.setPosition(
            playerId,
            api.getPosition(target)
        );

        return false;
    }

    if (command === "!bring") {
        if (!args[1]) {
            api.sendMessage(
                playerId,
                "!bring <player>",
                {
                    color: "yellow"
                }
            );

            return false;
        }

        const target =
            findPlayer(args[1]);

        if (!target) {
            api.sendMessage(
                playerId,
                "Player not found.",
                {
                    color: "red"
                }
            );

            return false;
        }

        if (
            isOwner(target) &&
            !isOwner(playerId)
        ) {
            api.sendMessage(
                playerId,
                "You cannot bring the owner.",
                {
                    color: "red"
                }
            );

            return false;
        }

        api.setPosition(
            target,
            api.getPosition(playerId)
        );

        api.sendMessage(
            playerId,
            `Brought ${api.getEntityName(target)}.`,
            {
                color: "lime"
            }
        );

        return false;
    }

    if (
        command === "!mute" ||
        command === "!unmute"
    ) {
        if (!args[1]) {
            api.sendMessage(
                playerId,
                `${command} <player>`,
                {
                    color: "yellow"
                }
            );

            return false;
        }

        const target =
            findPlayer(args[1]);

        if (!target) {
            api.sendMessage(
                playerId,
                "Player not found.",
                {
                    color: "red"
                }
            );

            return false;
        }

        if (command === "!mute") {
            if (isOwner(target)) {
                api.sendMessage(
                    playerId,
                    "You cannot mute the owner.",
                    {
                        color: "red"
                    }
                );

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
        } else {
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
        }

        return false;
    }
};

onPlayerKilledOtherPlayer = () => {
    return "keepInventory";
};

onPlayerJoin = playerId => {
    const username =
        api.getEntityName(playerId);

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
    stockOnJoin(playerId);
};

function adminPointsCommand(
    playerId,
    command
) {
    const args =
        String(command)
            .trim()
            .replace(/^\/+/, "")
            .split(/\s+/);

    const root =
        args[0].toLowerCase();

    if (
        root !== "point" &&
        root !== "points"
    ) {
        return;
    }

    if (!args[1]) {
        showBalance(playerId);
        return true;
    }

    const action =
        args[1].toLowerCase();

    if (
        action !== "give" &&
        action !== "take" &&
        action !== "clear"
    ) {
        api.sendMessage(
            playerId,
            "/points give <username> <amount>\n" +
            "/points take <username> <amount>\n" +
            "/points clear <username>",
            {
                color: "yellow"
            }
        );

        return true;
    }

    if (!isMod(playerId)) {
        api.sendMessage(
            playerId,
            "You do not have permission to use this command.",
            {
                color: "red"
            }
        );

        return true;
    }

    if (!args[2]) {
        api.sendMessage(
            playerId,
            action === "clear"
                ? "/points clear <username>"
                : `/points ${action} <username> <amount>`,
            {
                color: "yellow"
            }
        );

        return true;
    }

    const target =
        findPlayer(args[2]);

    if (!target) {
        api.sendMessage(
            playerId,
            "Player not found. The player must be online.",
            {
                color: "red"
            }
        );

        return true;
    }

    const name =
        api.getEntityName(target);

    const current =
        walletGet(target);

    if (action === "clear") {
        walletSet(
            target,
            0
        );

        api.sendMessage(
            playerId,
            `Cleared ${name}'s ${CURRENCY_NAME} balance.`,
            {
                color: "lime"
            }
        );

        api.sendMessage(
            target,
            `Your ${CURRENCY_NAME} balance was cleared by an admin.`,
            {
                color: "orange"
            }
        );

        return true;
    }

    const amount =
        Math.floor(
            Number(args[3])
        );

    if (
        !Number.isFinite(amount) ||
        amount < 1
    ) {
        api.sendMessage(
            playerId,
            "Amount must be at least 1.",
            {
                color: "yellow"
            }
        );

        return true;
    }

    if (action === "give") {
        const next =
            current + amount;

        walletSet(
            target,
            next
        );

        api.sendMessage(
            playerId,
            `Gave ${money(amount)} to ${name}. New balance: ${money(next)}.`,
            {
                color: "lime"
            }
        );

        api.sendMessage(
            target,
            `An admin gave you ${money(amount)}. Your new balance is ${money(next)}.`,
            {
                color: "gold"
            }
        );

        return true;
    }

    const taken =
        Math.min(
            amount,
            current
        );

    const next =
        current - taken;

    walletSet(
        target,
        next
    );

    api.sendMessage(
        playerId,
        `Took ${money(taken)} from ${name}. New balance: ${money(next)}.`,
        {
            color: "orange"
        }
    );

    api.sendMessage(
        target,
        `An admin took ${money(taken)} from you. Your new balance is ${money(next)}.`,
        {
            color: "red"
        }
    );

    return true;
}

playerCommand = (
    playerId,
    command
) => {
    const raw =
        String(command)
            .trim()
            .replace(/^\/+/, "");

    const cmd =
        raw.toLowerCase();

    const adminResult =
        adminPointsCommand(
            playerId,
            raw
        );

    if (
        adminResult === true
    ) {
        return true;
    }

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
        cmd === "point" ||
        cmd === "points" ||
        cmd === "balance"
    ) {
        showBalance(playerId);
        return true;
    }

    if (
        cmd.startsWith("convert ")
    ) {
        convertDiamonds(
            playerId,
            cmd.substring(9).trim()
        );

        return true;
    }

    const stockResult =
        stockCommand(
            playerId,
            raw
        );

    if (
        stockResult === true
    ) {
        return true;
    }

    const auctionResult =
        auctionCommand(
            playerId,
            raw
        );

    if (
        auctionResult === true
    ) {
        return true;
    }

    return;
};

const AH_CATEGORY =
    "ANDREW_AUCTION_HOUSE";

const AH_DATA_KEY =
    "andrew_auction_house_v2";

const AH_STARTING_BALANCE =
    500;

const AH_DURATION =
    5 * 60 * 1000;

const AH_MAX_LISTINGS =
    30;

const AH_MIN_INCREMENT =
    1;

let auctionLoaded =
    false;

let auctionShopInitialized =
    false;

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

    const saved =
        api.getLobbyDbValue(
            AH_DATA_KEY
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
                auctionState =
                    parsed;
            }
        } catch (e) {}
    }

    auctionState.nextId ||=
        1;

    auctionState.listings ||=
        {};

    auctionState.pendingItems ||=
        {};

    auctionState.pendingMoney ||=
        {};

    auctionLoaded =
        true;
}

function auctionSave() {
    auctionLoad();

    api.setLobbyDbValue(
        AH_DATA_KEY,
        JSON.stringify(
            auctionState
        )
    );
}

function auctionGetBalance(
    playerId
) {
    return walletGet(
        playerId
    );
}

function auctionSetBalance(
    playerId,
    amount
) {
    walletSet(
        playerId,
        amount
    );
}

function auctionAddItemByDbId(
    dbId,
    item
) {
    if (
        !item ||
        !item.name
    ) {
        return;
    }

    const amount =
        item.amount == null
            ? 1
            : item.amount;

    if (
        amount <= 0
    ) {
        return;
    }

    const playerId =
        api.getPlayerIdFromDbId(
            String(dbId)
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

        if (
            remaining > 0
        ) {
            auctionState.pendingItems[
                String(dbId)
            ] ||= [];

            auctionState.pendingItems[
                String(dbId)
            ].push({
                name: item.name,
                amount: remaining,
                attributes: item.attributes
            });
        }
    } else {
        auctionState.pendingItems[
            String(dbId)
        ] ||= [];

        auctionState.pendingItems[
            String(dbId)
        ].push({
            name: item.name,
            amount: amount,
            attributes: item.attributes
        });
    }
}

function auctionClaim(
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
            auctionState.pendingMoney[
                dbId
            ] || 0
        );

    if (
        pendingMoney > 0
    ) {
        walletSet(
            playerId,
            walletGet(playerId) +
            pendingMoney
        );

        delete auctionState.pendingMoney[
            dbId
        ];

        api.sendMessage(
            playerId,
            `Auction House: You received ${money(pendingMoney)}.`,
            {
                color: "lime"
            }
        );
    }

    const pending =
        auctionState.pendingItems[
            dbId
        ] || [];

    const remain = [];

    for (
        const item of pending
    ) {
        if (
            !item ||
            !item.name ||
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

        const left =
            item.amount -
            added;

        if (
            left > 0
        ) {
            remain.push({
                name: item.name,
                amount: left,
                attributes: item.attributes
            });
        }
    }

    if (
        remain.length
    ) {
        auctionState.pendingItems[
            dbId
        ] = remain;
    } else {
        delete auctionState.pendingItems[
            dbId
        ];
    }

    auctionSave();
}

function auctionTime(
    ms
) {
    const s =
        Math.max(
            0,
            Math.ceil(
                ms / 1000
            )
        );

    return s >= 60
        ? `${Math.floor(s / 60)}m ${s % 60}s`
        : `${s}s`;
}

function auctionCount() {
    auctionLoad();

    return Object.keys(
        auctionState.listings
    ).length;
}

function auctionMinimum(
    listing
) {
    return listing.currentBid > 0
        ? listing.currentBid +
            Math.max(
                AH_MIN_INCREMENT,
                Math.ceil(
                    listing.currentBid *
                    0.05
                )
            )
        : listing.startingPrice;
}

function auctionDescription(
    listing
) {
    const min =
        auctionMinimum(
            listing
        );

    return [
        `SELLER  ${listing.sellerName}`,
        `AMOUNT  ${listing.item.amount}`,
        `CURRENT ${money(listing.currentBid || listing.startingPrice)}`,
        `MINIMUM ${money(min)}`,
        `TIME    ${auctionTime(listing.endAt - api.now())}`
    ].join("\n");
}

function auctionCreateShop(
    listing
) {
    const key =
        `auction_${listing.id}`;

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
                `👑 #${listing.id} • ${listing.item.name}`,
            description:
                auctionDescription(
                    listing
                ),
            userInput: {
                type: "number",
                placeholderText:
                    `Enter ${CURRENCY_NAME} bid`,
                initialValue:
                    String(
                        auctionMinimum(
                            listing
                        )
                    )
            },
            sortPriority:
                1000 -
                listing.id
        }
    );

    auctionShopKeys[
        key
    ] = true;
}

function auctionUpdateShop(
    listing
) {
    const key =
        `auction_${listing.id}`;

    try {
        api.updateShopItem(
            AH_CATEGORY,
            key,
            {
                customTitle:
                    `👑 #${listing.id} • ${listing.item.name}`,
                description:
                    auctionDescription(
                        listing
                    ),
                userInput: {
                    type: "number",
                    placeholderText:
                        `Enter ${CURRENCY_NAME} bid`,
                    initialValue:
                        String(
                            auctionMinimum(
                                listing
                            )
                        )
                }
            }
        );
    } catch (e) {
        auctionCreateShop(
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
                    "👑 ANDREW'S AUCTION HOUSE",
                description:
                    `Live auctions • real-time bidding • ${CURRENCY_NAME}`,
                sortPriority:
                    -200
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
                    `Hold an item and choose its starting ${CURRENCY_NAME}.`,
                userInput: {
                    type: "number",
                    placeholderText:
                        "Starting price",
                    initialValue:
                        "100"
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
                    `💰 YOUR ${CURRENCY_NAME}`,
                description:
                    `Shared ${CURRENCY_NAME} wallet • Auction House + Stock Market`,
                sortPriority:
                    9998
            }
        );

        auctionShopInitialized =
            true;
    }

    for (
        const id in auctionState.listings
    ) {
        const listing =
            auctionState.listings[id];

        const key =
            `auction_${listing.id}`;

        if (
            auctionShopKeys[key]
        ) {
            auctionUpdateShop(
                listing
            );
        } else {
            auctionCreateShop(
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

function auctionList(
    playerId,
    price
) {
    auctionLoad();

    price =
        Math.floor(
            Number(price)
        );

    if (
        !Number.isFinite(price) ||
        price < 1
    ) {
        api.sendMessage(
            playerId,
            `Starting price must be at least 1 ${CURRENCY_NAME}.`,
            {
                color: "red"
            }
        );

        return;
    }

    if (
        auctionCount() >=
        AH_MAX_LISTINGS
    ) {
        api.sendMessage(
            playerId,
            "The auction house is full.",
            {
                color: "red"
            }
        );

        return;
    }

    const slot =
        api.getSelectedInventorySlotI(
            playerId
        );

    const item =
        api.getItemSlot(
            playerId,
            slot
        );

    if (
        !item ||
        !item.name
    ) {
        api.sendMessage(
            playerId,
            "Hold the item you want to sell first.",
            {
                color: "red"
            }
        );

        return;
    }

    const amount =
        item.amount == null
            ? 1
            : item.amount;

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
            name:
                item.name,

            amount:
                amount,

            attributes:
                item.attributes
        },

        startingPrice:
            price,

        currentBid:
            0,

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
        slot,
        "Air",
        null,
        undefined,
        true
    );

    auctionState.listings[
        String(
            listing.id
        )
    ] = listing;

    auctionSave();
    auctionEnsureShop();

    api.sendMessage(
        playerId,
        `Listed ${amount}x ${item.name} for ${money(price)}.`,
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

function auctionBid(
    playerId,
    listingId,
    bid
) {
    auctionLoad();

    const listing =
        auctionState.listings[
            String(
                listingId
            )
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
        auctionFinish(
            listing
        );

        api.sendOverShopInfo(
            playerId,
            "Auction has ended."
        );

        return;
    }

    const bidder =
        String(
            api.getPlayerDbId(
                playerId
            )
        );

    if (
        bidder ===
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

    bid =
        Math.floor(
            Number(bid)
        );

    const minimum =
        auctionMinimum(
            listing
        );

    if (
        !Number.isFinite(bid) ||
        bid < minimum
    ) {
        api.sendOverShopInfo(
            playerId,
            `Minimum bid: ${money(minimum)}.`
        );

        return;
    }

    const balance =
        walletGet(
            playerId
        );

    if (
        balance < bid
    ) {
        api.sendOverShopInfo(
            playerId,
            `You need ${money(bid)}. You have ${money(balance)}.`
        );

        return;
    }

    walletSet(
        playerId,
        balance - bid
    );

    if (
        listing.currentBidderDbId
    ) {
        walletAddDb(
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
                `You were outbid on auction #${listing.id}. Your ${money(listing.currentBid)} was refunded.`,
                {
                    color: "orange"
                }
            );
        }
    }

    listing.currentBid =
        bid;

    listing.currentBidderDbId =
        bidder;

    listing.currentBidderName =
        api.getEntityName(
            playerId
        );

    auctionSave();

    auctionUpdateShop(
        listing
    );

    api.sendOverShopInfo(
        playerId,
        `Bid placed: ${money(bid)}`
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
            `Auction #${listing.id} received a ${money(bid)} bid from ${api.getEntityName(playerId)}.`,
            {
                color: "yellow"
            }
        );
    }
}

function auctionFinish(
    listing
) {
    auctionLoad();

    const key =
        String(
            listing.id
        );

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
        auctionShopKeys[shopKey]
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

        walletAddDb(
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
                `🏆 You won auction #${listing.id} for ${money(listing.currentBid)}!`,
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
                `🏆 Your auction #${listing.id} sold for ${money(listing.currentBid)}!`,
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
            String(
                listingId
            )
        ];

    if (!listing) {
        api.sendMessage(
            playerId,
            "Auction not found.",
            {
                color: "red"
            }
        );

        return;
    }

    if (
        String(
            api.getPlayerDbId(
                playerId
            )
        ) !==
        String(
            listing.sellerDbId
        )
    ) {
        api.sendMessage(
            playerId,
            "You can only cancel your own listing.",
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
            "You cannot cancel after someone has bid.",
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
        String(
            listingId
        )
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

function auctionShowMine(
    playerId
) {
    auctionLoad();

    const dbId =
        String(
            api.getPlayerDbId(
                playerId
            )
        );

    const mine =
        Object.values(
            auctionState.listings
        ).filter(
            x =>
                String(
                    x.sellerDbId
                ) === dbId
        );

    if (!mine.length) {
        api.sendMessage(
            playerId,
            "You have no active auctions.",
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
        const listing of mine
    ) {
        api.sendMessage(
            playerId,
            `#${listing.id} | ${listing.item.amount}x ${listing.item.name} | ${money(listing.currentBid || listing.startingPrice)} | ${auctionTime(listing.endAt - api.now())}`
        );
    }
}

function auctionCommand(
    playerId,
    command
) {
    const args =
        String(command)
            .trim()
            .replace(/^\/+/, "")
            .toLowerCase()
            .split(/\s+/);

    if (
        args[0] !== "auction" &&
        args[0] !== "a"
    ) {
        return;
    }

    const sub =
        args[1];

    if (!sub) {
        auctionOpen(
            playerId
        );

        return true;
    }

    if (
        sub === "help"
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
            `/auction balance - Check ${CURRENCY_NAME}`
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
            `/auction convert <diamonds> - Convert ${CURRENCY_NAME} to Diamonds`
        );

        return true;
    }

    if (
        sub === "balance"
    ) {
        showBalance(
            playerId
        );

        return true;
    }

    if (
        sub === "my"
    ) {
        auctionShowMine(
            playerId
        );

        return true;
    }

    if (
        sub === "claim"
    ) {
        auctionClaim(
            playerId
        );

        return true;
    }

    if (
        sub === "convert"
    ) {
        convertDiamonds(
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
                "/auction sell <price>",
                {
                    color: "yellow"
                }
            );

            return true;
        }

        auctionList(
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
                "/auction cancel <id>",
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

    auctionClaim(
        playerId
    );

    auctionEnsureShop();
}

function auctionShopPurchase(
    playerId,
    categoryKey,
    itemKey,
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
        auctionList(
            playerId,
            userInput
        );

        return;
    }

    if (
        itemKey ===
        "auction_balance"
    ) {
        showBalance(
            playerId
        );

        return;
    }

    if (
        itemKey.startsWith(
            "auction_"
        )
    ) {
        auctionBid(
            playerId,
            Number(
                itemKey.substring(8)
            ),
            userInput
        );
    }
}

const STOCK_CATEGORY =
    "ANDREW_STOCK_MARKET";

const STOCK_DATA_KEY =
    "andrew_stock_market_v1";

const STOCK_PORTFOLIO_KEY =
    "andrew_stock_portfolio_v1";

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

let stockLoaded =
    false;

let stockShopInitialized =
    false;

let stockTickTimer =
    0;

let stockSaveTimer =
    0;

let stockState = {
    trend: 0,
    event: "Market Open",
    stocks: {}
};

function stockLoad() {
    if (
        stockLoaded
    ) {
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
                stockState =
                    parsed;
            }
        } catch (e) {}
    }

    stockState.stocks ||=
        {};

    stockState.trend =
        Number.isFinite(
            Number(
                stockState.trend
            )
        )
            ? Number(
                stockState.trend
            )
            : 0;

    stockState.event ||=
        "Market Open";

    for (
        const symbol in STOCKS
    ) {
        const info =
            STOCKS[symbol];

        stockState.stocks[
            symbol
        ] ||= {
            price:
                info.price,

            previousPrice:
                info.price,

            history:
                Array(
                    30
                ).fill(
                    info.price
                )
        };

        const s =
            stockState.stocks[
                symbol
            ];

        s.price =
            Number.isFinite(
                Number(
                    s.price
                )
            )
                ? Number(
                    s.price
                )
                : info.price;

        s.previousPrice =
            Number.isFinite(
                Number(
                    s.previousPrice
                )
            )
                ? Number(
                    s.previousPrice
                )
                : s.price;

        if (
            !Array.isArray(
                s.history
            )
        ) {
            s.history = [];
        }

        while (
            s.history.length <
            30
        ) {
            s.history.unshift(
                s.price
            );
        }

        if (
            s.history.length >
            30
        ) {
            s.history =
                s.history.slice(
                    -30
                );
        }
    }

    stockLoaded =
        true;
}

function stockSave() {
    stockLoad();

    api.setLobbyDbValue(
        STOCK_DATA_KEY,
        JSON.stringify(
            stockState
        )
    );
}

function stockPortfolioGet(
    playerId
) {
    const saved =
        api.getPlayerDbValue(
            playerId,
            STOCK_PORTFOLIO_KEY
        );

    if (!saved) {
        return {};
    }

    try {
        const p =
            JSON.parse(
                String(saved)
            );

        return p &&
            typeof p === "object"
            ? p
            : {};
    } catch (e) {
        return {};
    }
}

function stockPortfolioSet(
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

function stockPrice(
    symbol
) {
    stockLoad();

    return Math.max(
        1,
        Math.floor(
            Number(
                stockState.stocks[
                    symbol
                ]?.price ||
                1
            )
        )
    );
}

function stockChange(
    symbol
) {
    stockLoad();

    const s =
        stockState.stocks[
            symbol
        ];

    if (
        !s ||
        !s.previousPrice
    ) {
        return 0;
    }

    return (
        (
            s.price -
            s.previousPrice
        ) /
        s.previousPrice
    ) * 100;
}

function stockSparkline(
    symbol
) {
    stockLoad();

    const values =
        (
            stockState.stocks[
                symbol
            ]?.history ||
            []
        ).slice(
            -24
        );

    if (
        !values.length
    ) {
        return "────────";
    }

    const min =
        Math.min(
            ...values
        );

    const max =
        Math.max(
            ...values
        );

    if (
        min === max
    ) {
        return "▄".repeat(
            values.length
        );
    }

    const chars =
        "▁▂▃▄▅▆▇█";

    return values
        .map(
            v =>
                chars[
                    Math.max(
                        0,
                        Math.min(
                            7,
                            Math.floor(
                                (
                                    (
                                        v -
                                        min
                                    ) /
                                    (
                                        max -
                                        min
                                    )
                                ) *
                                7
                            )
                        )
                    )
                ]
        )
        .join("");
}

function stockDesc(
    symbol
) {
    const info =
        STOCKS[symbol];

    const change =
        stockChange(
            symbol
        );

    const direction =
        change > 0.01
            ? "↗"
            : change < -0.01
                ? "↘"
                : "→";

    const pct =
        change >= 0
            ? `+${change.toFixed(2)}%`
            : `${change.toFixed(2)}%`;

    return (
        `${info.name}\n` +
        `${info.sector}  •  ${direction} ${pct}\n` +
        `PRICE  ${money(stockPrice(symbol))} / SHARE\n` +
        `TREND  ${stockSparkline(symbol)}\n` +
        `MARKET  ${stockState.event}`
    );
}

function stockBuy(
    playerId,
    symbol,
    amount
) {
    stockLoad();

    symbol =
        String(
            symbol
        ).toUpperCase();

    amount =
        Math.floor(
            Number(amount)
        );

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
        stockPrice(
            symbol
        );

    const total =
        price * amount;

    const balance =
        walletGet(
            playerId
        );

    if (
        balance < total
    ) {
        api.sendMessage(
            playerId,
            `You need ${money(total)}. You only have ${money(balance)}.`,
            {
                color: "red"
            }
        );

        return;
    }

    const portfolio =
        stockPortfolioGet(
            playerId
        );

    portfolio[symbol] ||=
        {
            shares: 0,
            costBasis: 0
        };

    portfolio[symbol]
        .shares +=
        amount;

    portfolio[symbol]
        .costBasis +=
        total;

    walletSet(
        playerId,
        balance - total
    );

    stockPortfolioSet(
        playerId,
        portfolio
    );

    api.sendOverShopInfo(
        playerId,
        `Bought ${amount} ${symbol} shares for ${money(total)}`
    );
}

function stockSell(
    playerId,
    symbol,
    amount
) {
    stockLoad();

    symbol =
        String(
            symbol
        ).toUpperCase();

    amount =
        Math.floor(
            Number(amount)
        );

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
        stockPortfolioGet(
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
        stockPrice(
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

    const average =
        oldShares > 0
            ? oldBasis /
              oldShares
            : 0;

    const profit =
        proceeds -
        average *
        amount;

    portfolio[symbol]
        .shares -=
        amount;

    portfolio[symbol]
        .costBasis =
            Math.max(
                0,
                oldBasis -
                average *
                amount
            );

    if (
        portfolio[symbol]
            .shares <= 0
    ) {
        delete portfolio[
            symbol
        ];
    }

    stockPortfolioSet(
        playerId,
        portfolio
    );

    walletSet(
        playerId,
        walletGet(playerId) +
        proceeds
    );

    api.sendOverShopInfo(
        playerId,
        `Sold ${amount} ${symbol} for ${money(proceeds)} | P/L ${Math.floor(profit)} ${CURRENCY_NAME}`
    );
}

function stockPortfolioShow(
    playerId
) {
    const portfolio =
        stockPortfolioGet(
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
        !symbols.length
    ) {
        api.sendMessage(
            playerId,
            "You don't own any stocks."
        );

        return;
    }

    let value = 0;
    let basis = 0;

    for (
        const symbol of symbols
    ) {
        const h =
            portfolio[symbol];

        const v =
            stockPrice(
                symbol
            ) *
            h.shares;

        const p =
            v -
            h.costBasis;

        value += v;
        basis += h.costBasis;

        api.sendMessage(
            playerId,
            `${symbol}: ${h.shares} shares | ${money(v)} | P/L ${Math.floor(p)} ${CURRENCY_NAME}`,
            {
                color:
                    p >= 0
                        ? "lime"
                        : "red"
            }
        );
    }

    api.sendMessage(
        playerId,
        `Stock Value: ${money(value)}`
    );

    api.sendMessage(
        playerId,
        `Invested: ${money(basis)}`
    );

    api.sendMessage(
        playerId,
        `Cash: ${money(walletGet(playerId))}`,
        {
            color: "gold"
        }
    );
}

function convertDiamonds(
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
        CURRENCY_PER_DIAMOND;

    const balance =
        walletGet(
            playerId
        );

    if (
        balance < required
    ) {
        api.sendMessage(
            playerId,
            `You need ${money(required)} for ${diamonds} Diamond${diamonds === 1 ? "" : "s"}. You have ${money(balance)}.`,
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
            `Your inventory is full. No ${CURRENCY_NAME} were taken.`,
            {
                color: "red"
            }
        );

        return;
    }

    walletSet(
        playerId,
        balance -
        added *
        CURRENCY_PER_DIAMOND
    );

    api.sendMessage(
        playerId,
        `Converted ${money(added * CURRENCY_PER_DIAMOND)} into ${added} Diamond${added === 1 ? "" : "s"}.`,
        {
            color: "aqua"
        }
    );
}

function stockEnsureShop() {
    stockLoad();

    if (
        !stockShopInitialized
    ) {
        api.configureShopCategory(
            STOCK_CATEGORY,
            {
                customTitle:
                    "📈 ANDREW STOCK MARKET",
                description:
                    `Live market • ${CURRENCY_NAME} • prices update every 2 seconds`,
                sortPriority:
                    -100
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
                    "📊 MARKET DASHBOARD",
                description:
                    `${CURRENCY_PER_BUNDLE} ${CURRENCY_NAME} = ${DIAMONDS_PER_BUNDLE} Diamonds`,
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
                    `💰 YOUR ${CURRENCY_NAME}`,
                description:
                    `Shared ${CURRENCY_NAME} wallet • Auction House + Stock Market`,
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
                    "View your shares, value, and P/L.",
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
                    `💎 ${CURRENCY_NAME} → DIAMONDS`,
                description:
                    `${CURRENCY_PER_BUNDLE} ${CURRENCY_NAME} = ${DIAMONDS_PER_BUNDLE} Diamonds.`,
                userInput: {
                    type:
                        "number",
                    placeholderText:
                        "Diamonds",
                    initialValue:
                        String(
                            DIAMONDS_PER_BUNDLE
                        )
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
            api.createShopItem(
                STOCK_CATEGORY,
                `buy_${symbol}`,
                {
                    image:
                        "fa-solid fa-crown",
                    cost: 0,
                    canBuy: true,
                    buyButtonText:
                        "BUY SHARES",
                    customTitle:
                        `👑 BUY ${symbol}`,
                    description:
                        stockDesc(
                            symbol
                        ),
                    userInput: {
                        type:
                            "number",
                        placeholderText:
                            "Share quantity",
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
                        "fa-solid fa-crown",
                    cost: 0,
                    canBuy: true,
                    buyButtonText:
                        "SELL SHARES",
                    customTitle:
                        `👑 SELL ${symbol}`,
                    description:
                        stockDesc(
                            symbol
                        ),
                    userInput: {
                        type:
                            "number",
                        placeholderText:
                            "Share quantity",
                        initialValue:
                            "1"
                    },
                    sortPriority:
                        priority--
                }
            );
        }

        stockShopInitialized =
            true;
    }

    for (
        const symbol in STOCKS
    ) {
        stockUpdateShop(
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
                        stockState.trend >= 0
                            ? "BULLISH ↗"
                            : "BEARISH ↘"
                    }\n` +
                    `Event: ${stockState.event}\n` +
                    `Prices update every 2 seconds.\n` +
                    `${CURRENCY_PER_BUNDLE} ${CURRENCY_NAME} = ${DIAMONDS_PER_BUNDLE} Diamonds`
            }
        );
    } catch (e) {}
}

function stockUpdateShop(
    symbol
) {
    const info =
        STOCKS[symbol];

    const price =
        stockPrice(
            symbol
        );

    const change =
        stockChange(
            symbol
        );

    const direction =
        change > 0.01
            ? "↗"
            : change < -0.01
                ? "↘"
                : "→";

    const pct =
        change >= 0
            ? `+${change.toFixed(2)}%`
            : `${change.toFixed(2)}%`;

    try {
        api.updateShopItem(
            STOCK_CATEGORY,
            `buy_${symbol}`,
            {
                image:
                    "fa-solid fa-crown",
                customTitle:
                    `💚 👑 BUY ${symbol}  •  ${money(price)}`,
                description:
                    `${info.name}\n` +
                    `${info.sector}  •  ${direction} ${pct}\n` +
                    `PRICE  ${money(price)} / SHARE\n` +
                    `TREND  ${stockSparkline(symbol)}\n` +
                    `MARKET  ${stockState.event}`,
                buyButtonText:
                    "BUY SHARES"
            }
        );

        api.updateShopItem(
            STOCK_CATEGORY,
            `sell_${symbol}`,
            {
                image:
                    "fa-solid fa-crown",
                customTitle:
                    `❤️ 👑 SELL ${symbol}  •  ${money(price)}`,
                description:
                    `${info.name}\n` +
                    `${info.sector}  •  ${direction} ${pct}\n` +
                    `PRICE  ${money(price)} / SHARE\n` +
                    `TREND  ${stockSparkline(symbol)}\n` +
                    `MARKET  ${stockState.event}`,
                buyButtonText:
                    "SELL SHARES"
            }
        );
    } catch (e) {}
}

function stockOpen(
    playerId
) {
    stockEnsureShop();

    api.openShop(
        playerId,
        false,
        STOCK_CATEGORY,
        false
    );
}

function stockShopPurchase(
    playerId,
    categoryKey,
    itemKey,
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
            `${stockState.event} | Live prices`
        );

        return;
    }

    if (
        itemKey ===
        "stock_balance"
    ) {
        showBalance(
            playerId
        );

        return;
    }

    if (
        itemKey ===
        "stock_portfolio"
    ) {
        stockPortfolioShow(
            playerId
        );

        return;
    }

    if (
        itemKey ===
        "stock_convert"
    ) {
        convertDiamonds(
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

function stockCommand(
    playerId,
    command
) {
    const args =
        String(command)
            .trim()
            .replace(/^\/+/, "")
            .toLowerCase()
            .split(/\s+/);

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
        stockOpen(
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
                fontWeight: "bold"
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
            `/convert ${DIAMONDS_PER_BUNDLE} - ${CURRENCY_PER_BUNDLE} ${CURRENCY_NAME} = ${DIAMONDS_PER_BUNDLE} Diamonds`
        );

        return true;
    }

    if (
        sub === "portfolio" ||
        sub === "p"
    ) {
        stockPortfolioShow(
            playerId
        );

        return true;
    }

    if (
        sub === "balance" ||
        sub === "points"
    ) {
        showBalance(
            playerId
        );

        return true;
    }

    if (
        sub === "convert"
    ) {
        convertDiamonds(
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

    stockOpen(
        playerId
    );

    return true;
}

function stockOnJoin(
    playerId
) {
    stockLoad();

    walletGet(
        playerId
    );

    stockEnsureShop();
}

function stockTick(
    ms
) {
    stockTickTimer +=
        ms;

    stockSaveTimer +=
        ms;

    if (
        stockTickTimer >=
        2000
    ) {
        stockTickTimer =
            0;

        stockLoad();

        stockState.trend =
            (
                Number(
                    stockState.trend
                ) +
                (
                    Math.random() -
                    0.5
                ) *
                0.001
            ) *
            0.96;

        if (
            Math.random() <
            0.03
        ) {
            const r =
                Math.random();

            if (
                r < 0.33
            ) {
                stockState.event =
                    "Market Boom ↗";

                stockState.trend +=
                    0.018;
            } else if (
                r < 0.66
            ) {
                stockState.event =
                    "Market Dip ↘";

                stockState.trend -=
                    0.018;
            } else {
                stockState.event =
                    "Stable Trading →";
            }
        }

        for (
            const symbol in STOCKS
        ) {
            const info =
                STOCKS[symbol];

            const s =
                stockState.stocks[
                    symbol
                ];

            s.previousPrice =
                s.price;

            const randomMove =
                (
                    Math.random() -
                    0.5
                ) *
                2 *
                info.volatility;

            const trendMove =
                stockState.trend *
                info.beta;

            s.price =
                Math.max(
                    1,
                    Math.round(
                        s.price *
                        Math.exp(
                            randomMove +
                            trendMove
                        )
                    )
                );

            s.history.push(
                s.price
            );

            if (
                s.history.length >
                30
            ) {
                s.history.shift();
            }
        }

        stockSave();

        if (
            stockShopInitialized
        ) {
            for (
                const symbol in STOCKS
            ) {
                stockUpdateShop(
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
                            stockState.trend >= 0
                                ? "BULLISH ↗"
                                : "BEARISH ↘"
                        }\n` +
                        `Event: ${stockState.event}\n` +
                        `Prices update every 2 seconds.\n` +
                        `${CURRENCY_PER_BUNDLE} ${CURRENCY_NAME} = ${DIAMONDS_PER_BUNDLE} Diamonds`
                }
            );
        } catch (e) {}
    }

    if (
        stockSaveTimer >=
        15000
    ) {
        stockSaveTimer =
            0;

        stockSave();
    }
}

let auctionTickTimer =
    0;

function auctionTick(
    ms
) {
    auctionTickTimer +=
        ms;

    if (
        auctionTickTimer <
        1000
    ) {
        return;
    }

    auctionTickTimer =
        0;

    auctionLoad();

    let changed =
        false;

    for (
        const id in auctionState.listings
    ) {
        const listing =
            auctionState.listings[id];

        if (
            listing.endAt <=
            api.now()
        ) {
            auctionFinish(
                listing
            );

            changed =
                true;
        } else if (
            auctionShopInitialized
        ) {
            auctionUpdateShop(
                listing
            );
        }
    }

    if (
        changed
    ) {
        auctionSave();
    }
}

tick = ms => {
    auctionTick(
        ms
    );

    stockTick(
        ms
    );
};

onPlayerBoughtShopItem = (
    playerId,
    categoryKey,
    itemKey,
    item,
    userInput
) => {
    auctionShopPurchase(
        playerId,
        categoryKey,
        itemKey,
        userInput
    );

    stockShopPurchase(
        playerId,
        categoryKey,
        itemKey,
        userInput
    );
};

doPeriodicSave = () => {
    if (
        auctionLoaded
    ) {
        auctionSave();
    }

    if (
        stockLoaded
    ) {
        stockSave();
    }
};
