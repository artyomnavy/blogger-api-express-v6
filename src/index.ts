import {app} from './settings';
import {port, runDb} from "./db/db";

app.listen(port, async () => {
    await runDb()
})