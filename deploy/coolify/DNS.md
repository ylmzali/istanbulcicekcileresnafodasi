# DNS records for this Coolify practice instance

## Local (Colima) — add to /etc/hosts

```
127.0.0.1 iceo.local
127.0.0.1 www.iceo.local
127.0.0.1 coolify.iceo.local
127.0.0.1 app.iceo.local
```

Apply:

```bash
bash deploy/coolify/03b-local-hosts.sh 127.0.0.1 iceo.local
# then paste the printed lines with: sudo tee -a /etc/hosts
```

Panel (works without hosts): http://127.0.0.1:8000  
Login: `admin@localhost.local` (password set at first registration)

## Real VPS

```bash
bash deploy/coolify/03-print-dns.sh <VPS_PUBLIC_IP> <YOURDOMAIN>
```

Then create A records at the registrar and set Coolify instance domain to `coolify.YOURDOMAIN`.
