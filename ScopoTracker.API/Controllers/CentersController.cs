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
    public class CentersController : ApiController
    {
        private ScopoTrackerContext db = new ScopoTrackerContext();

        // GET: api/Centers
        public IQueryable<Center> GetCenter()
        {
            return db.Center;
        }

        // GET: api/Centers/5
        [ResponseType(typeof(Center))]
        public IHttpActionResult GetCenter(int id)
        {
            Center center = db.Center.Find(id);
            if (center == null)
            {
                return NotFound();
            }

            return Ok(center);
        }

        // PUT: api/Centers/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutCenter(int id, Center center)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != center.CenterID)
            {
                return BadRequest();
            }

            db.Entry(center).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CenterExists(id))
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

        // POST: api/Centers
        [ResponseType(typeof(Center))]
        public IHttpActionResult PostCenter(Center center)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Center.Add(center);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = center.CenterID }, center);
        }

        // DELETE: api/Centers/5
        [ResponseType(typeof(Center))]
        public IHttpActionResult DeleteCenter(int id)
        {
            Center center = db.Center.Find(id);
            if (center == null)
            {
                return NotFound();
            }

            db.Center.Remove(center);
            db.SaveChanges();

            return Ok(center);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CenterExists(int id)
        {
            return db.Center.Count(e => e.CenterID == id) > 0;
        }
    }
}