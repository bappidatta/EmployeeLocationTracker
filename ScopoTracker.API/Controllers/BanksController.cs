using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using ScopoTracker.API.Models;

namespace ScopoTracker.API.Controllers
{
    [Authorize]
    public class BanksController : ApiController
    {
        private ScopoTrackerContext db = new ScopoTrackerContext();

        // GET: api/Banks
        public IQueryable<Bank> GetBank()
        {
            return db.Bank;
        }

        // GET: api/Banks/5
        [ResponseType(typeof(Bank))]
        public IHttpActionResult GetBank(int id)
        {
            Bank bank = db.Bank.Find(id);
            if (bank == null)
            {
                return NotFound();
            }

            return Ok(bank);
        }

        // PUT: api/Banks/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutBank(int id, Bank bank)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != bank.BankID)
            {
                return BadRequest();
            }

            db.Entry(bank).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BankExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Banks
        [ResponseType(typeof(Bank))]
        public IHttpActionResult PostBank(Bank bank)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Bank.Add(bank);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = bank.BankID }, bank);
        }

        // DELETE: api/Banks/5
        [ResponseType(typeof(Bank))]
        public IHttpActionResult DeleteBank(int id)
        {
            Bank bank = db.Bank.Find(id);
            if (bank == null)
            {
                return NotFound();
            }

            db.Bank.Remove(bank);
            db.SaveChanges();

            return Ok(bank);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool BankExists(int id)
        {
            return db.Bank.Count(e => e.BankID == id) > 0;
        }
    }
}