# Removing the demo dog profiles from the live database

The demo profiles (Bodhi, Atlas, Miso and the rest) have no owner. Since the
change that adds `SEED_DEMO_PROFILES`, the server no longer re-creates them on
every start, but rows that were already seeded stay in the database until they
are deleted once, by hand.

Real owners' dogs always have an owner, so "no owner" is the safe marker.

1. In the Render dashboard, open the `canidknot-db` database and its **Connect**
   tab, then open a `psql` shell (or any SQL client).
2. Look first, and check the list is only demo dogs:

   ```sql
   SELECT "id", "name", "breed", "city" FROM "DogProfile" WHERE "ownerId" IS NULL;
   ```

3. If it is, delete them:

   ```sql
   DELETE FROM "DogProfile" WHERE "ownerId" IS NULL;
   ```

   Photos, health records, interests and matches that belong to a deleted
   profile go with it, which is what you want for demo data.

Keep `SEED_DEMO_PROFILES` unset on Render. Set it to `true` only on a local or
preview database when you want sample dogs to design against.
