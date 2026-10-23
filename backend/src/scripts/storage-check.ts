import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
});
const path = `healthcheck/${Date.now()}.txt`;

const up = await supabase.storage.from("resume").upload(path, Buffer.from("hello"), { contentType: "text/plain" });
console.log("upload:", up.error ? `FAILED: ${up.error.message}` : "ok");

const signed = await supabase.storage.from("resume").createSignedUrl(path, 60);
console.log("signed url:", signed.error ? `FAILED: ${signed.error.message}` : "ok");

const del = await supabase.storage.from("resume").remove([path]);
console.log("delete:", del.error ? `FAILED: ${del.error.message}` : "ok");