interface WebAppUser {
    id: number;
    is_bot?: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
}

interface WebAppInitData {
    query_id?: string;
    user?: WebAppUser;
    receiver?: WebAppUser;
    chat?: {
        id: number;
        type: "group" | "supergroup" | "channel";
        title: string;
        username?: string;
        photo_url?: string;
    };
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
}

interface TelegramWebApp {
    initData: string;
    initDataUnsafe: WebAppInitData;
    version: string;
    platform: string;
    colorScheme: "light" | "dark";
    themeParams: {
        bg_color: string;
        text_color: string;
        hint_color: string;
        link_color: string;
        button_color: string;
        button_text_color: string;
        secondary_bg_color: string;
    };
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    headerColor: string;
    backgroundColor: string;
    isClosingConfirmationEnabled: boolean;
    BackButton: {
        isVisible: boolean;
        onClick(callback: () => void): void;
        offClick(callback: () => void): void;
        show(): void;
        hide(): void;
    };
    MainButton: {
        text: string;
        color: string;
        textColor: string;
        isVisible: boolean;
        isActive: boolean;
        isProgressVisible: boolean;
        setText(text: string): void;
        onClick(callback: () => void): void;
        offClick(callback: () => void): void;
        show(): void;
        hide(): void;
        enable(): void;
        disable(): void;
        showProgress(disable?: boolean): void;
        hideProgress(): void;
        setParams(params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
        }): void;
    };
    HapticFeedback: {
        impactOccurred(
            style: "light" | "medium" | "heavy" | "rigid" | "soft"
        ): void;
        notificationOccurred(type: "error" | "success" | "warning"): void;
        selectionChanged(): void;
    };
    close(): void;
    ready(): void;
}

interface Window {
    Telegram?: {
        WebApp?: TelegramWebApp;
    };
}
