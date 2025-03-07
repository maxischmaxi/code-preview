import Link from "next/link";

export default function Page() {
    return (
        <main className="container mx-auto px-8">
            <div className="space-y-4 py-8 md:py-24">
                <h1 className="text-2xl">
                    Impressum für Softwareentwickler nach geltendem EU-Recht
                </h1>
                <p className="font-bold">
                    Impressum für Softwareentwickler nach geltendem EU-Recht
                    Angaben gemäß § 5 TMG
                </p>
                <p>
                    Maximilian Jeschek
                    <br />
                    Bürgerstraße 30
                    <br />
                    01127 Dresden DE
                </p>
                <p className="font-bold">Kontakt:</p>
                <p>E-Mail: max@jeschek.dev</p>
                <p className="font-bold">Haftung für Inhalte</p>
                <p className="font-bold">Verbraucherhinweise:</p>
                <p>Streitschlichtung:</p>
                <p>
                    Die Europäische Kommission stellt eine Plattform zur
                    Online-Streitbeilegung bereit:{" "}
                    <Link
                        href="https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&lng=EN"
                        target="_blank"
                        className="text-blue-400 hover:underline"
                    >
                        https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&lng=EN
                    </Link>
                    .
                </p>
                <p>
                    Zur Teilnahme an einem Streitbeilegungsverfahren vor einer
                    Verbraucherschlichtungsstelle bin ich nicht verpflichtet.
                </p>
                <p>Haftungsausschluss:</p>
                <p>
                    Die Inhalte dieser Website wurden mit größtmöglicher
                    Sorgfalt erstellt. Ich übernehme jedoch keine Gewähr für die
                    Richtigkeit, Vollständigkeit und Aktualität der
                    bereitgestellten Inhalte.
                </p>
                <p>
                    Die Nutzung der Website erfolgt auf eigene Gefahr. In keinem
                    Fall bin ich für direkte oder indirekte Schäden haftbar, die
                    durch die Nutzung der Website entstehen, insbesondere
                    aufgrund von Datenverlusten oder der Nutzung unzulässiger
                    Inhalte.
                </p>
                <p>Urheberrecht:</p>
                <p>
                    Die auf dieser Website veröffentlichten Inhalte sind
                    urheberrechtlich geschützt. Die Vervielfältigung,
                    Bearbeitung und Verbreitung dieser Inhalte bedarf der
                    vorherigen schriftlichen Zustimmung des Autors.
                </p>
                <p>Datenschutz:</p>
                <p>
                    Die Nutzung dieser Website ist in der Regel ohne Angabe
                    personenbezogener Daten möglich. Soweit auf dieser Website
                    personenbezogene Daten erhoben werden, erfolgt dies stets im
                    Einklang mit der Datenschutzgrundverordnung (DSGVO).
                </p>
                <p>
                    Weitere Informationen zum Datenschutz finden Sie in meiner{" "}
                    <Link
                        href="/privacy-policy"
                        target="_blank"
                        className="text-blue-400 hover:underline"
                    >
                        Datenschutzerklärung
                    </Link>
                    .
                </p>
            </div>
        </main>
    );
}
