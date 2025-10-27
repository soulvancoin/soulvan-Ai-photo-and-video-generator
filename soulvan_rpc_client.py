"""Soulvan blockchain RPC client helpers for anchoring 4K AI assets."""

from __future__ import annotations

import json
import os
import pathlib
from dataclasses import dataclass, field
from typing import Any, Dict, Optional

import requests


@dataclass
class AssetMetadata:
    """Describes a generated asset that should be registered on-chain."""

    asset_type: str
    resolution: str
    uri: str
    content_sha256: str
    prompt: Optional[str] = None
    model: Optional[str] = None
    extras: Dict[str, Any] = field(default_factory=dict)

    def to_compact_json(self) -> str:
        payload = {
            "asset_type": self.asset_type,
            "resolution": self.resolution,
            "uri": self.uri,
            "sha256": self.content_sha256,
        }

        if self.prompt:
            payload["prompt"] = self.prompt
        if self.model:
            payload["model"] = self.model
        if self.extras:
            payload["extras"] = self.extras

        return json.dumps({"v": 1, "data": payload}, separators=(",", ":"))


class SoulvanRPCClient:
    """Minimal JSON-RPC client tailored for Soulvan-coin Core."""

    def __init__(
        self,
        url: Optional[str] = None,
        *,
        username: Optional[str] = None,
        password: Optional[str] = None,
        timeout_seconds: int = 30,
    ) -> None:
        self.url = url or os.environ["SOULVAN_RPC_URL"]
        rpc_user = username or os.environ["SOULVAN_RPC_USER"]
        rpc_pass = password or os.environ["SOULVAN_RPC_PASS"]
        self.auth = (rpc_user, rpc_pass)
        self.timeout_seconds = timeout_seconds

    def _call(self, method: str, params: Optional[list[Any]] = None) -> Any:
        payload = {
            "jsonrpc": "2.0",
            "id": "soulvan-rpc-client",
            "method": method,
            "params": params or [],
        }

        response = requests.post(
            self.url,
            json=payload,
            auth=self.auth,
            timeout=self.timeout_seconds,
        )
        response.raise_for_status()
        body = response.json()

        if body.get("error"):
            raise RuntimeError(f"Soulvan RPC error: {body['error']}")

        return body.get("result")

    def ensure_wallet_unlocked(self) -> None:
        info = self._call("getwalletinfo")
        if info.get("unlocked_until", 0) == 0:
            raise RuntimeError(
                "The Soulvan wallet is locked. Unlock it before anchoring metadata."
            )

    def anchor_asset_metadata(
        self,
        metadata: AssetMetadata,
        *,
        label: str = "4k_ai_asset",
    ) -> str:
        self.ensure_wallet_unlocked()

        op_return_hex = metadata.to_compact_json().encode("utf-8").hex()

        raw_tx = self._call("createrawtransaction", [[], {"data": op_return_hex}])
        funded_tx = self._call("fundrawtransaction", [raw_tx, {"replaceable": False}])
        signed_tx = self._call("signrawtransactionwithwallet", [funded_tx["hex"]])

        if not signed_tx.get("complete"):
            raise RuntimeError("Wallet failed to sign the Soulvan transaction")

        txid = self._call("sendrawtransaction", [signed_tx["hex"]])

        try:
            self._call("settxlabel", [txid, label])
        except Exception:
            pass

        return txid


def compute_file_sha256(path: str | os.PathLike[str], *, chunk_size: int = 2**20) -> str:
    import hashlib

    hasher = hashlib.sha256()
    with open(path, "rb") as handle:
        while True:
            chunk = handle.read(chunk_size)
            if not chunk:
                break
            hasher.update(chunk)
    return hasher.hexdigest()


def build_metadata_from_asset(
    asset_path: str | os.PathLike[str],
    *,
    uri: str,
    asset_type: str,
    resolution: str,
    prompt: Optional[str] = None,
    model: Optional[str] = None,
    extras: Optional[Dict[str, Any]] = None,
) -> AssetMetadata:
    resolved_path = pathlib.Path(asset_path)
    if not resolved_path.exists():
        raise FileNotFoundError(resolved_path)

    file_hash = compute_file_sha256(resolved_path)
    return AssetMetadata(
        asset_type=asset_type,
        resolution=resolution,
        uri=uri,
        content_sha256=file_hash,
        prompt=prompt,
        model=model,
        extras=extras or {},
    )


__all__ = [
    "AssetMetadata",
    "SoulvanRPCClient",
    "compute_file_sha256",
    "build_metadata_from_asset",
]