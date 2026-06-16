# EcoFlow PowerOcean — Geräte mit Volta verknüpfen

## Warum?

Damit wir die PV-Anlagen unserer Kunden im birdie-Dashboard live monitoren können (Produktion, Batterie-SoC, Verbrauch, Störungen), müssen die EcoFlow PowerOcean-Geräte mit dem Volta-Account verknüpft sein.

**Ohne Verknüpfung:** Keine Live-Daten, kein Monitoring, keine Alarme.
**Mit Verknüpfung:** Echtzeit-Daten aller Kundenanlagen auf einen Blick.

---

## Option A: Gerät direkt unter Volta registrieren (bei Neuinstallation)

**Wann:** Bei jeder neuen EcoFlow PowerOcean Installation.

1. EcoFlow App öffnen (Android/iOS)
2. Einloggen mit dem **Volta-Account:**
   - E-Mail: `na@volta-energietechnik.de`
   - Passwort: (bei Sarah erfragen)
3. "+" tippen → "Gerät hinzufügen"
4. PowerOcean auswählen
5. QR-Code auf dem Gerät scannen ODER Seriennummer (SN) manuell eingeben
   - SN steht auf dem Typenschild des PowerOcean (z.B. `HW51ZxxxxxxDE`)
6. WLAN-Setup durchführen (das WLAN des Kunden nutzen)
7. Gerätenamen vergeben: **"Kundenname — Ort"** (z.B. "Müller — Weinböhla")
8. Fertig! Gerät erscheint automatisch im birdie-Dashboard.

**Wichtig:** Der Kunde kann trotzdem die EcoFlow App nutzen — er muss nur als "Mitbenutzer" eingeladen werden (siehe Option C).

---

## Option B: Bestehendes Kundengerät mit Volta teilen

**Wann:** Kunde hat PowerOcean bereits selbst in seiner EcoFlow App registriert.

### Schritt 1: Kunde teilt das Gerät

Der Kunde muss in seiner EcoFlow App:
1. Das PowerOcean-Gerät öffnen
2. Einstellungen (Zahnrad) → "Gerät teilen" / "Share Device"
3. E-Mail eingeben: `na@volta-energietechnik.de`
4. Bestätigen

### Schritt 2: Volta akzeptiert

1. In der EcoFlow App mit dem Volta-Account einloggen
2. Einladung annehmen
3. Gerät umbenennen: **"Kundenname — Ort"**

---

## Option C: Kunden als Mitbenutzer einladen (nach Option A)

Falls das Gerät unter dem Volta-Account registriert wurde und der Kunde es auch in seiner App sehen will:

1. In der EcoFlow App mit Volta-Account einloggen
2. PowerOcean-Gerät öffnen
3. Einstellungen → "Gerät teilen"
4. Kunden-E-Mail eingeben
5. Kunde akzeptiert in seiner App

---

## Seriennummer (SN) finden

Die SN steht auf:
- **Typenschild** des PowerOcean (Rückseite/Unterseite)
- **Verpackung** (Barcode-Aufkleber)
- **EcoFlow App** unter Geräteeinstellungen → "Über dieses Gerät"
- **Reonic** (falls bei Installation dokumentiert)

Format: `HW51Z...DE` (ca. 15 Zeichen)

---

## Checkliste für Vertriebler/Elektriker

Bei **jeder** EcoFlow-Installation:

- [ ] PowerOcean mit Volta-Account (`na@volta-energietechnik.de`) registriert
- [ ] Gerätename gesetzt: "Kundenname — Ort"
- [ ] Gerät ist online (grüner Punkt in der App)
- [ ] Seriennummer in Reonic-Projekt dokumentiert
- [ ] Kunde als Mitbenutzer eingeladen (falls gewünscht)

---

## FAQ

**Q: Kann ein Gerät in zwei Accounts gleichzeitig sein?**
A: Ja, über die "Teilen"-Funktion. Der Hauptaccount hat volle Kontrolle, der Mitbenutzer sieht Daten.

**Q: Was passiert wenn der Kunde sein Gerät schon registriert hat?**
A: Dann Option B nutzen — Kunde teilt das Gerät mit Volta.

**Q: Brauche ich vor Ort WLAN-Zugang?**
A: Ja, der PowerOcean verbindet sich über das Kunden-WLAN mit der Cloud.

**Q: Was ist mit Bestandskunden?**
A: Kunden kontaktieren und bitten, das Gerät mit `na@volta-energietechnik.de` zu teilen. Kann per E-Mail-Vorlage gemacht werden.

---

*Letzte Aktualisierung: 07.06.2026 — birdie/Volta*
