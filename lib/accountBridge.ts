/**
 * Account bridge: allows LoadedApp (iframe) apps to access the user's
 * account profile via postMessage.
 *
 * Permission model:
 * - System apps and apps installed through the App Store: read + write.
 * - External apps (sideloaded): read-only balance.
 */

export const ACCOUNT_BRIDGE_REQUEST = "__pyhdraAccountRequest";
export const ACCOUNT_BRIDGE_RESPONSE = "__pyhdraAccountResponse";

export type AccountBridgeAction = "getProfile" | "updateBalance";

export type AccountBridgeRequest = {
  __pyhdra: typeof ACCOUNT_BRIDGE_REQUEST;
  action: AccountBridgeAction;
  balance?: number;
  requestId: number;
};

export type AccountBridgeResponse = {
  __pyhdra: typeof ACCOUNT_BRIDGE_RESPONSE;
  allowed: boolean;
  balance?: number;
  profile?: unknown;
  requestId: number;
};

export const isAccountBridgeRequest = (
  data: unknown
): data is AccountBridgeRequest =>
  typeof data === "object" &&
  data !== null &&
  (data as AccountBridgeRequest).__pyhdra === ACCOUNT_BRIDGE_REQUEST;

export const ACCOUNT_BRIDGE_SCRIPT = `
<script data-pyhdra-account-bridge>
(function () {
  if (window.pyhdraAccount) return;

  var nextRequestId = 1;
  var pending = {};

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.__pyhdra !== "${ACCOUNT_BRIDGE_RESPONSE}") return;

    var entry = pending[data.requestId];
    if (!entry) return;

    delete pending[data.requestId];
    entry(data);
  });

  function request(action, payload) {
    return new Promise(function (resolve) {
      var requestId = nextRequestId++;
      pending[requestId] = resolve;
      window.parent.postMessage(
        Object.assign(
          {
            __pyhdra: "${ACCOUNT_BRIDGE_REQUEST}",
            action: action,
            requestId: requestId
          },
          payload || {}
        ),
        "*"
      );
    });
  }

  window.pyhdraAccount = {
    getBalance: function () {
      return request("getProfile").then(function (res) {
        return res.allowed && res.profile ? res.profile.balance : null;
      });
    },
    getProfile: function () {
      return request("getProfile").then(function (res) {
        return res.allowed ? res.profile : null;
      });
    },
    updateBalance: function (balance) {
      return request("updateBalance", { balance: balance }).then(function (res) {
        return Boolean(res.allowed);
      });
    }
  };
})();
</script>`;

export const injectAccountBridge = (html: string): string => {
  if (html.includes("</body>")) {
    return html.replace("</body>", `${ACCOUNT_BRIDGE_SCRIPT}</body>`);
  }

  return html + ACCOUNT_BRIDGE_SCRIPT;
};
