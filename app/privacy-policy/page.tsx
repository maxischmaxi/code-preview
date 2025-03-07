import Link from "next/link";

export default function Page() {
    return (
        <main className="container mx-auto px-8">
            <div className="space-y-4 py-8 md:py-24">
                <h1 className="text-2xl">
                    Datenschutzerklärung für Softwareentwickler nach geltendem
                    EU-Recht
                </h1>
                <p className="font-bold">Einleitung</p>
                <p>
                    Diese Datenschutzerklärung erläutert, wie Maximilian Jeschek
                    (im Folgenden &quot;ich&quot; oder &quot;wir&quot;) mit
                    personenbezogenen Daten umgeht, die bei der Nutzung dieser
                    Website erhoben werden.
                </p>
                <p className="font-bold">
                    Erhebung und Verwendung personenbezogener Daten
                </p>
                <p className="font-bold">Nutzung der Website</p>
                <p>
                    Bei der Nutzung dieser Website werden automatisch folgende
                    Informationen erhoben und in Protokolldateien gespeichert:
                </p>
                <ul className="list-inside list-disc">
                    <li>IP-Adresse des Nutzers</li>
                    <li>Browser-Informationen</li>
                    <li>Referrer-URL</li>
                    <li>Hostname des zugreifenden Rechners</li>
                    <li>Uhrzeit der Serveranfrage</li>
                </ul>
                <p>
                    Diese Informationen werden ausschließlich zur statistischen
                    Auswertung und zur Verbesserung der Website verwendet. Eine
                    personenbezogene Auswertung findet nicht statt.
                </p>
                <p className="font-semibold">Cookies</p>
                <p>
                    Diese Website verwendet Cookies. Cookies sind kleine
                    Textdateien, die auf Ihrem Computer oder mobilen Gerät
                    gespeichert werden, wenn Sie eine Website besuchen. Sie
                    ermöglichen es der Website, sich Ihre Aktionen und
                    Präferenzen (z. B. Login, Sprache, Schriftgröße und andere
                    Anzeigeeinstellungen) über einen bestimmten Zeitraum hinweg
                    zu merken, so dass Sie diese nicht jedes Mal neu eingeben
                    müssen, wenn Sie die Website besuchen oder von einer Seite
                    zur anderen wechseln.
                </p>
                <p>
                    Sie können Cookies in Ihrem Browser jederzeit deaktivieren.
                    Die Deaktivierung von Cookies kann jedoch dazu führen, dass
                    einige Funktionen dieser Website nicht mehr ordnungsgemäß
                    funktionieren.
                </p>
                <p className="font-bold">Einbindung von Diensten Dritter</p>
                <p>
                    Diese Website kann Dienste Dritter integrieren, z. B.
                    Social-Media-Buttons oder Google Maps. Diese Dienste können
                    von den Anbietern dieser Dienste personenbezogene Daten
                    erheben. Weitere Informationen zum Datenschutz dieser
                    Anbieter finden Sie in den Datenschutzhinweisen der
                    jeweiligen Anbieter.
                </p>
                <p className="font-bold">Ihre Rechte</p>
                <p>Sie haben das Recht:</p>
                <ul className="list-inside list-disc">
                    <li>
                        Auskunft über Ihre bei mir gespeicherten
                        personenbezogenen Daten zu verlangen.
                    </li>
                    <li>
                        Die Berichtigung unrichtiger oder unvollständiger
                        personenbezogener Daten zu verlangen.
                    </li>
                    <li>
                        Die Löschung Ihrer personenbezogenen Daten zu verlangen.
                    </li>
                    <li>
                        Die Einschränkung der Verarbeitung Ihrer
                        personenbezogenen Daten zu verlangen.
                    </li>
                    <li>
                        Widerspruch gegen die Verarbeitung Ihrer
                        personenbezogenen Daten einzulegen.
                    </li>
                    <li>
                        Ihre personenbezogenen Daten in einem strukturierten,
                        gängigen und maschinenlesbaren Format zu erhalten und
                        sie an einen anderen Verantwortlichen zu übermitteln.
                    </li>
                </ul>
                <p className="font-bold">Kontaktaufnahme</p>
                <p>
                    Wenn Sie Fragen zum Datenschutz haben, können Sie sich
                    jederzeit an mich wenden:
                </p>
                <Link
                    href="mailto:max@jeschek.dev"
                    className="text-blue-400 hover:underline"
                >
                    max@jeschek.dev
                </Link>
            </div>
        </main>
    );
}
