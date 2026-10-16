# Participation architecture
- Store consultation learning materials in one parent-scoped table and a private storage bucket; inherited parent visibility prevents exposing private attachments.
- Calculate ballot totals in database triggers and expose individual ballots only to their owners; public UI reads aggregate counts rather than identifiable votes.
- Keep participation copy in a dedicated dictionary consumed by the shared translation hook; new participation screens follow existing language selection.
- Use plain-text downloadable reading packs and opt-in media loading; weak connections should not require downloading images or video to understand a consultation.- Sealed-result polls tally into a private table and reveal counts only through a server function after close; never write their counts to the public poll row.
