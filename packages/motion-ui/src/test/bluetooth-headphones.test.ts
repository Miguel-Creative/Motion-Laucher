import { afterEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { runSettingAction } from "@/lib/actions";
import { SETTINGS_SECTIONS, settingStatus } from "@/lib/settings-schema";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

vi.mock("sonner", () => {
  const notify = Object.assign(vi.fn(), {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  });
  return { toast: notify };
});

describe("Pareamento de fones Bluetooth no projetor", () => {
  afterEach(() => {
    delete window.MotionNative;
    vi.clearAllMocks();
  });

  it("oferece a opção focável na categoria Áudio e Mídia", () => {
    const section = SETTINGS_SECTIONS.find((item) => item.id === "audio");
    const bluetooth = section?.items.find((item) => item.id === "audio.bluetoothHeadphones");
    expect(bluetooth).toMatchObject({
      label: "Conectar fone Bluetooth",
      type: "action",
      action: "open-bluetooth-audio",
      actionLabel: "Procurar fones",
    });
    expect(settingStatus(bluetooth!, true).ready).toBe(true);
  });

  it("envia o comando real para a ponte Android em vez de simular o pareamento", async () => {
    const openBluetoothAudioSettings = vi.fn();
    window.MotionNative = { openBluetoothAudioSettings } as unknown as typeof window.MotionNative;
    const navigate = vi.fn();
    await runSettingAction("open-bluetooth-audio", navigate);
    expect(openBluetoothAudioSettings).toHaveBeenCalledOnce();
    expect(navigate).not.toHaveBeenCalled();
    expect(toast.info).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("explica quando a prévia web não consegue parear dispositivos", async () => {
    await runSettingAction("open-bluetooth-audio", vi.fn());
    expect(toast.info).toHaveBeenCalledWith(
      "Conecte seu fone pelo projetor",
      expect.objectContaining({ description: expect.stringContaining("prévia web não pode parear") }),
    );
  });

  it("não confunde um bridge antigo com acesso ao Bluetooth", async () => {
    window.MotionNative = { isNative: () => true } as unknown as typeof window.MotionNative;
    await runSettingAction("open-bluetooth-audio", vi.fn());
    expect(toast.info).toHaveBeenCalled();
  });

  it("mapeia a ação para intent Android Bluetooth com alternativa de firmware", () => {
    const java = readFileSync(
      resolve(process.cwd(), "apps/motion-android/app/src/main/java/pro/creativezone/motionlauncher/MainActivity.java"),
      "utf8",
    );
    expect(java).toContain("@JavascriptInterface public void openBluetoothAudioSettings()");
    expect(java).toContain("Settings.ACTION_BLUETOOTH_SETTINGS");
    expect(java).toContain("Settings.ACTION_WIRELESS_SETTINGS");
    expect(java).toContain("Settings.ACTION_SETTINGS");
    expect(java).not.toContain("BluetoothAdapter.getDefaultAdapter().enable()");
  });
});
