import { IBookingRepository } from "@/domain/repositories/IBookingRepository";
import { BookingDTO, CreateBookingRequest } from "@/dto";
import api from "@/lib/api";

class BookingRepositoryAPI implements IBookingRepository {
  async createBooking(request: CreateBookingRequest): Promise<BookingDTO> {
    try {
      const response = await api.post("/api/bookings", request);

      console.log("Create Booking Response:", response.data);

      // Backend có thể trả về { success, message, data } hoặc trực tiếp data
      const bookingData = response.data.data || response.data;

      return this.mapResponseToEntity(bookingData);
    } catch (error) {
      console.error("Error creating booking:", error);
      const err = error as {
        response?: {
          status: number;
          statusText: string;
          data?: { message?: string };
        };
        message?: string;
      };

      if (err.response) {
        throw new Error(
          `Failed to create booking: ${err.response.status} - ${
            err.response.data?.message || err.response.statusText
          }`
        );
      }
      throw new Error(err.message || "Failed to create booking");
    }
  }

  async getBookingById(bookingId: string): Promise<BookingDTO> {
    try {
      const response = await api.get(`/api/bookings/${bookingId}`);

      console.log("Get Booking Response:", response.data);

      const bookingData = response.data.data || response.data;
      return this.mapResponseToEntity(bookingData);
    } catch (error) {
      console.error("Error getting booking:", error);
      const err = error as {
        response?: {
          status: number;
          statusText: string;
          data?: { message?: string };
        };
        message?: string;
      };

      if (err.response) {
        throw new Error(
          `Failed to get booking: ${err.response.status} - ${
            err.response.data?.message || err.response.statusText
          }`
        );
      }
      throw new Error(err.message || "Failed to get booking");
    }
  }

  async getAllBookingOfUser(userId: string): Promise<BookingDTO[]> {
    try {
      const response = await api.get(`/api/bookings/user/${userId}`);

      console.log("Get User Bookings Response:", response.data);

      const data = response.data.data || response.data;

      // If data is array, map all, otherwise return single item in array
      if (Array.isArray(data)) {
        return data.map((item) => this.mapResponseToEntity(item));
      }
      return [this.mapResponseToEntity(data)];
    } catch (error) {
      console.error("Error getting user bookings:", error);
      const err = error as {
        response?: {
          status: number;
          statusText: string;
          data?: { message?: string };
        };
        message?: string;
      };

      if (err.response) {
        throw new Error(
          `Failed to get user bookings: ${err.response.status} - ${
            err.response.data?.message || err.response.statusText
          }`
        );
      }
      throw new Error(err.message || "Failed to get user bookings");
    }
  }

  async updateBookingStatus(
    bookingId: string,
    status: string
  ): Promise<BookingDTO> {
    try {
      const response = await api.put(`/api/bookings/${bookingId}/status`, {
        status,
      });

      console.log("Update Booking Status Response:", response.data);

      const bookingData = response.data.data || response.data;
      return this.mapResponseToEntity(bookingData);
    } catch (error) {
      console.error("Error updating booking status:", error);
      const err = error as {
        response?: {
          status: number;
          statusText: string;
          data?: { message?: string };
        };
        message?: string;
      };

      if (err.response) {
        throw new Error(
          `Failed to update booking status: ${err.response.status} - ${
            err.response.data?.message || err.response.statusText
          }`
        );
      }
      throw new Error(err.message || "Failed to update booking status");
    }
  }

  private mapResponseToEntity(data: BookingDTO): BookingDTO {
    return {
      bookingID: data.bookingID,
      userName: data.userName,
      vehicleName: data.vehicleName,
      stationName: data.stationName,
      batteryType: data.batteryType,
      planName: data.planName,
      bookingTime: data.bookingTime,
      createdAt: data.createdAt,
      status: data.status as "pending" | "cancelled" | "completed",
    };
  }
}

// Export singleton instance
export const bookingRepositoryAPI = new BookingRepositoryAPI();
